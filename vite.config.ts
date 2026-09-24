import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  const geminiModel = env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const openaiApiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
  const openaiModel = env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  return {
    plugins: [
      react(),
      {
        name: 'ai-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const rawUrl = req.url || '';
            const urlPath = rawUrl.split('?')[0];

            if (!urlPath.startsWith('/api/ai/') && urlPath !== '/api/ai-tutor' && urlPath !== '/api/ai-tutor/status') {
              return next();
            }

            const sendJson = (status: number, data: any) => {
              res.statusCode = status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };

            const readBody = (): Promise<any> => {
              return new Promise((resolve, reject) => {
                let data = '';
                req.on('data', chunk => { data += chunk; });
                req.on('end', () => {
                  try {
                    resolve(data ? JSON.parse(data) : {});
                  } catch (e) {
                    reject(e);
                  }
                });
                req.on('error', reject);
              });
            };

            try {
              // 0. OpenAI AI Tutor Endpoint (POST /api/ai-tutor or POST /api/ai/tutor)
              if ((urlPath === '/api/ai-tutor' || urlPath === '/api/ai/tutor') && req.method === 'POST') {
                const body = await readBody();
                const { handleAITutorRequest } = await import('./src/server/aiTutorHandler.js');
                const result = await handleAITutorRequest(body, {
                  apiKey: openaiApiKey,
                  model: openaiModel
                });
                return sendJson(result.status, result.body);
              }

              // Endpoint: /api/ai-tutor/status (GET)
              if (urlPath === '/api/ai-tutor/status' && req.method === 'GET') {
                return sendJson(200, {
                  configured: Boolean(openaiApiKey),
                  model: openaiModel
                });
              }

              // 1. Server-side PDF Text Extraction Endpoint (Runs locally in Node.js, zero external API key needed)
              if (req.url === '/api/ai/extract-pdf-text' && req.method === 'POST') {
                const body = await readBody();
                const base64 = body.base64 || body.base64Data || body.data;
                if (!base64) {
                  return sendJson(400, { error: 'No base64 PDF data provided.' });
                }

                try {
                  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
                  const buffer = Buffer.from(base64, 'base64');
                  const loadingTask = pdfjsLib.getDocument({
                    data: new Uint8Array(buffer),
                    disableFontFace: true
                  });
                  const pdf = await loadingTask.promise;
                  const extractedPages: { pageNumber: number; text: string; lines: string[] }[] = [];
                  const totalPages = Math.min(pdf.numPages, 100);

                  function reconstructPageLines(items: any[]): { text: string; lines: string[] } {
                    if (!items || items.length === 0) return { text: '', lines: [] };
                    const valid: any[] = [];
                    for (const item of items) {
                      if (typeof item?.str !== 'string') continue;
                      if (!item.str && item.str !== ' ') continue;
                      const transform = item.transform || [1, 0, 0, 1, 0, 0];
                      const x = transform[4] || 0;
                      const y = transform[5] || 0;
                      const height = Math.abs(transform[3]) || 12;
                      const width = item.width || (item.str.length * (height * 0.5));
                      valid.push({ str: item.str, x, y, width, height });
                    }
                    if (valid.length === 0) return { text: '', lines: [] };

                    valid.sort((a, b) => {
                      if (Math.abs(b.y - a.y) > 3) return b.y - a.y;
                      return a.x - b.x;
                    });

                    const lineClusters: any[][] = [];
                    let currentCluster: any[] = [];
                    let currentY: number | null = null;
                    for (const item of valid) {
                      if (currentY === null) {
                        currentCluster = [item];
                        currentY = item.y;
                      } else if (Math.abs(item.y - currentY) <= 3.5) {
                        currentCluster.push(item);
                        currentY = (currentY * (currentCluster.length - 1) + item.y) / currentCluster.length;
                      } else {
                        lineClusters.push(currentCluster);
                        currentCluster = [item];
                        currentY = item.y;
                      }
                    }
                    if (currentCluster.length > 0) lineClusters.push(currentCluster);

                    const lines: string[] = [];
                    let prevLineY: number | null = null;
                    let prevHeight = 12;

                    for (const cluster of lineClusters) {
                      cluster.sort((a, b) => a.x - b.x);
                      let lineStr = '';
                      let prevEnd: number | null = null;
                      for (const item of cluster) {
                        if (item.str === '') continue;
                        if (prevEnd !== null) {
                          const gap = item.x - prevEnd;
                          if (gap > 1.8 && !lineStr.endsWith(' ') && !item.str.startsWith(' ')) {
                            lineStr += ' ';
                          }
                        }
                        lineStr += item.str;
                        prevEnd = item.x + item.width;
                      }
                      const trimmed = lineStr.trim();
                      if (!trimmed) continue;
                      if (/^(?:page\s*)?\d+(?:\s*(?:of|\/)\s*\d+)?$/i.test(trimmed) && cluster[0].y < 45) continue;

                      const avgY = cluster.reduce((sum: number, it: any) => sum + it.y, 0) / cluster.length;
                      const avgH = cluster.reduce((sum: number, it: any) => sum + it.height, 0) / cluster.length || prevHeight;
                      if (prevLineY !== null) {
                        const vGap = prevLineY - avgY;
                        if (vGap > avgH * 1.85 && lines.length > 0) {
                          lines.push('');
                        }
                      }
                      lines.push(trimmed);
                      prevLineY = avgY;
                      prevHeight = avgH;
                    }
                    return {
                      text: lines.join('\n'),
                      lines: lines.filter(l => l.length > 0)
                    };
                  }

                  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const { text: pageText, lines: pageLines } = reconstructPageLines(textContent.items as any[]);
                    if (pageText.trim()) {
                      extractedPages.push({ pageNumber: pageNum, text: pageText, lines: pageLines });
                    }
                  }

                  const fullText = extractedPages.map(p => `[Page ${p.pageNumber}]\n${p.text}`).join('\n\n');
                  return sendJson(200, {
                    success: true,
                    totalPages: pdf.numPages,
                    extractedPagesCount: extractedPages.length,
                    text: fullText,
                    pages: extractedPages
                  });
                } catch (pdfErr: any) {
                  console.error('Server-side PDF extraction error:', pdfErr);
                  return sendJson(500, { error: pdfErr?.message || 'Failed to parse PDF on server' });
                }
              }

              const clientHeaderApiKey = (req.headers['x-gemini-api-key'] as string) || '';

              // Endpoint: /api/ai/check-status
              if (req.url.startsWith('/api/ai/check-status') && req.method === 'GET') {
                const effectiveKey = clientHeaderApiKey || geminiApiKey;
                if (!effectiveKey) {
                  return sendJson(200, {
                    configured: false,
                    valid: false,
                    status: 'not_configured',
                    source: 'none',
                    message: 'No Gemini API key provided. Using offline NCERT curriculum engine.'
                  });
                }

                const urlObj = new URL(req.url, 'http://localhost');
                const shouldValidate = urlObj.searchParams.get('validate') === 'true';

                if (shouldValidate) {
                  try {
                    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=${effectiveKey}`;
                    const testRes = await fetch(testUrl);
                    if (testRes.ok) {
                      return sendJson(200, {
                        configured: true,
                        valid: true,
                        status: 'active',
                        source: clientHeaderApiKey ? 'client' : (geminiApiKey ? 'server' : 'none'),
                        model: geminiModel || 'gemini-1.5-flash',
                        message: 'API Key is Active & Valid! Successfully connected to Google Gemini.'
                      });
                    } else if (testRes.status === 400 || testRes.status === 403) {
                      const errData = await testRes.json().catch(() => null);
                      const detailMsg = errData?.error?.message || 'API key not valid or expired';
                      return sendJson(200, {
                        configured: false,
                        valid: false,
                        status: 'invalid_or_expired',
                        source: clientHeaderApiKey ? 'client' : (geminiApiKey ? 'server' : 'none'),
                        message: `Key Expired/Invalid: ${detailMsg}. Please generate a new key on Google AI Studio.`
                      });
                    } else if (testRes.status === 429) {
                      return sendJson(200, {
                        configured: true,
                        valid: false,
                        status: 'quota_exceeded',
                        source: clientHeaderApiKey ? 'client' : (geminiApiKey ? 'server' : 'none'),
                        message: 'Quota Exceeded: Your Google Gemini free tier rate limit was reached. Quota resets daily.'
                      });
                    } else {
                      return sendJson(200, {
                        configured: true,
                        valid: false,
                        status: 'error',
                        message: `Google Gemini responded with HTTP status ${testRes.status}.`
                      });
                    }
                  } catch (netErr: any) {
                    return sendJson(200, {
                      configured: true,
                      valid: false,
                      status: 'network_error',
                      message: `Network error connecting to Gemini API: ${netErr?.message || 'Unknown network error'}`
                    });
                  }
                }

                return sendJson(200, {
                  configured: true,
                  source: clientHeaderApiKey ? 'client' : (geminiApiKey ? 'server' : 'none'),
                  model: geminiModel || 'gemini-1.5-flash'
                });
              }

              // Endpoint: /api/ai/extract-chapters
              if (req.url === '/api/ai/extract-chapters' && req.method === 'POST') {
                const body = await readBody();
                const effectiveApiKey = clientHeaderApiKey || body.apiKey || geminiApiKey;
                const effectiveModel = body.model || geminiModel || 'gemini-1.5-flash';

                if (!effectiveApiKey) {
                  return sendJson(200, {
                    isDemoMode: true,
                    message: 'GEMINI_API_KEY not configured. Running in Demo Mode.'
                  });
                }

                const { text, subject, classLevel } = body;

                if (!text || text.trim().length < 15) {
                  return sendJson(400, { error: 'Text content is too short to extract chapters.' });
                }

                const prompt = `You are an expert curriculum parser for Indian and international school curricula (NCERT/CBSE/ICSE/State Boards, Classes 6-12).
Analyze the following extracted textbook/syllabus text for ${subject || 'General Studies'} (Class ${classLevel || 'General'}).

CRITICAL SOURCE-OF-TRUTH EXTRACTION RULES:
1. FIRST check for a Table of Contents (TOC) / Index / Syllabus Outline at the beginning of the text. If a Table of Contents is present, use it as the primary chapter map!
2. Two-Line Headings: If a line with "Chapter 1" or "Unit I" is followed by the chapter title on the next line (e.g. "Number Systems"), consolidate them into ONE chapter titled "Number Systems". Do NOT create separate entries for "Chapter 1" and "Number Systems".
3. STRICT NEGATIVE CONSTRAINT: Extract ONLY chapters that are physically present in this provided document text. DO NOT add or invent chapters from NCERT/CBSE memory if they are not in this document! If the document contains only 2 or 3 chapters, extract ONLY those 2 or 3 chapters.
4. Filter out explanatory prose sentences, definitions, and formulas (e.g. "A rational number can be written in the form p/q...").
5. For each verified chapter, extract 3 to 6 key core topics/sections that are actually discussed in the text under that chapter.

Return ONLY a valid JSON object matching this schema:
{
  "subject": "${subject || 'Subject'}",
  "class": "${classLevel || 'General'}",
  "chapters": [
    {
      "chapterId": "ch_01",
      "chapterName": "...",
      "topics": ["topic 1", "topic 2"],
      "prerequisites": ["prereq 1"],
      "importantConcepts": ["concept 1"]
    }
  ]
}

Document Text to analyze (up to 12000 chars):
${text.slice(0, 12000)}`;

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${effectiveApiKey}`;
                const apiRes = await fetch(geminiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                      responseMimeType: 'application/json',
                      temperature: 0.2
                    }
                  })
                });

                if (!apiRes.ok) {
                  const errText = await apiRes.text();
                  console.warn(`Gemini API error ${apiRes.status}:`, errText);
                  return sendJson(200, { isDemoMode: true, error: `Gemini API returned ${apiRes.status}` });
                }

                const result = await apiRes.json();
                const rawJson = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!rawJson) {
                  return sendJson(200, { isDemoMode: true, error: 'Empty response from Gemini' });
                }

                const parsed = JSON.parse(rawJson);
                return sendJson(200, { isDemoMode: false, data: parsed });
              }

              // Endpoint: /api/ai/generate-questions
              if (req.url === '/api/ai/generate-questions' && req.method === 'POST') {
                const body = await readBody();
                const effectiveApiKey = clientHeaderApiKey || body.apiKey || geminiApiKey;
                const effectiveModel = body.model || geminiModel || 'gemini-1.5-flash';

                if (!effectiveApiKey) {
                  return sendJson(200, {
                    isDemoMode: true,
                    message: 'GEMINI_API_KEY not configured. Running in Demo Mode.'
                  });
                }

                const { chapters, subject, classLevel, chapterAllocations, targetTotalQuestions = 30 } = body;

                if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
                  return sendJson(400, { error: 'No chapters provided for question generation.' });
                }

                const prompt = `You are a senior NCERT / CBSE / ICSE assessment author and diagnostic test architect for school students (Classes 6-12).
For the subject "${subject}" (Class "${classLevel || 'General'}"), create a balanced diagnostic pre-assessment containing EXACTLY ${targetTotalQuestions} questions.

CRITICAL SOURCE-OF-TRUTH CONSTRAINT:
Every question MUST test ONLY the concepts and topics of the chapters listed below. NEVER introduce chapters or outside concepts that are not in this syllabus map.

QUESTION ALLOCATION ACROSS CHAPTERS & DIFFICULTY:
${chapterAllocations && Array.isArray(chapterAllocations) && chapterAllocations.length > 0
  ? JSON.stringify(chapterAllocations, null, 2)
  : `Total Questions: ${targetTotalQuestions}. Evenly distribute questions across all ${chapters.length} chapters with approximately ~30% Easy, ~45% Moderate, and ~25% Difficult overall.`}

DIVERSITY & COGNITIVE QUESTION TYPES TO SPAN ACROSS QUESTIONS:
Use these genuine school examination question styles:
1. Definition & Terminology (direct concept recall)
2. Formula identification & symbolic relations
3. Formula application / Numerical computation (with realistic numerical values and units)
4. Conceptual understanding & underlying mechanism
5. "Which of the following statements is CORRECT?"
6. "Which of the following statements is INCORRECT?"
7. Real-world scenario / practical problem
8. Classification / grouping of items or properties
9. Matching or paired relationships
10. Assertion and Reason (Assertion A and Reason R)

STRICT QUALITY & ANTI-BOILERPLATE RULES:
1. NEVER USE REPETITIVE BOILERPLATE STEMS like:
   - "What fundamental principle primarily defines..."
   - "What is the primary role of..."
   - "When applying ... which step is essential?"
   - "In a multi-step scenario combining ... which conclusion is valid?"
2. NEVER USE REPETITIVE BOILERPLATE OPTIONS like:
   - "It defines the core rule and baseline properties..."
   - "It applies solely to unrelated auxiliary systems"
   - "It contradicts standard mathematical and scientific axioms"
   - "A change in boundary conditions causes a proportional shift..."
   - "Boundary conditions have zero effect..."
   - "Results are non-deterministic and cannot be reasoned logically"
3. EVERY OPTION MUST BE REALISTIC AND PLAUSIBLE:
   - For mathematical/science numericals: provide 4 distinct realistic numerical answers (e.g., ['15 cm', '30 cm', '45 cm', '10 cm']). Include common sign errors or formula mistakes as distractors.
   - For concept questions: provide 4 distinct, meaningful, educational statements.
4. Exactly 4 options per question.
5. Exactly one correct answer.
6. correctOption MUST be the 0-based integer index (0, 1, 2, or 3).
7. ROTATE correctOption evenly across 0, 1, 2, 3 throughout the test (do NOT bias towards 0 or 1).
8. No duplicate options within any question.
9. Distribute questions across different topics within each chapter for broad coverage.
10. Provide a clear, educational, step-by-step explanation for the correct answer.

Chapters to generate questions for:
${JSON.stringify(chapters, null, 2)}

Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "questionId": "q_001",
      "chapterId": "ch_01",
      "chapterName": "...",
      "topic": "...",
      "difficulty": "easy",
      "question": "...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": 1,
      "explanation": "...",
      "sourcePage": 1
    }
  ]
}`;

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${effectiveApiKey}`;
                const apiRes = await fetch(geminiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                      responseMimeType: 'application/json',
                      temperature: 0.3
                    }
                  })
                });

                if (!apiRes.ok) {
                  const errText = await apiRes.text();
                  console.warn(`Gemini API error ${apiRes.status}:`, errText);
                  return sendJson(200, { isDemoMode: true, error: `Gemini API returned ${apiRes.status}` });
                }

                const result = await apiRes.json();
                const rawJson = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!rawJson) {
                  return sendJson(200, { isDemoMode: true, error: 'Empty response from Gemini' });
                }

                const parsed = JSON.parse(rawJson);
                return sendJson(200, { isDemoMode: false, data: parsed });
              }

              // Endpoint: /api/ai/recommendation
              if (req.url === '/api/ai/recommendation' && req.method === 'POST') {
                const body = await readBody();
                const effectiveApiKey = clientHeaderApiKey || body.apiKey || geminiApiKey;
                const effectiveModel = body.model || geminiModel || 'gemini-1.5-flash';

                if (!effectiveApiKey) {
                  return sendJson(200, {
                    isDemoMode: true,
                    message: 'GEMINI_API_KEY not configured. Running in Demo Mode.'
                  });
                }

                const { summary } = body;

                const prompt = `You are GuruMitra's AI Learning Advisor for school students.
Analyze this structured diagnostic pre-assessment summary for a student:
${JSON.stringify(summary, null, 2)}

Provide an encouraging, clear, educational diagnostic evaluation.
Return ONLY a valid JSON object matching this schema:
{
  "summary": "2-3 sentences summarizing the student's baseline performance constructively",
  "strengthSummary": "1-2 sentences highlighting where the student demonstrated high confidence",
  "gapSummary": "1-2 sentences explaining the main conceptual gaps identified and why they matter",
  "nextSteps": [
    "Step 1: Specific foundation topic to review",
    "Step 2: Specific practice recommendation",
    "Step 3: Target reassessment milestone"
  ]
}Generic rules: avoid generic fluff, be specific to the student's assessed performance.`;

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${effectiveApiKey}`;
                const apiRes = await fetch(geminiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                      responseMimeType: 'application/json',
                      temperature: 0.4
                    }
                  })
                });

                if (!apiRes.ok) {
                  return sendJson(200, { isDemoMode: true });
                }

                const result = await apiRes.json();
                const rawJson = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                const parsed = rawJson ? JSON.parse(rawJson) : null;
                return sendJson(200, { isDemoMode: false, data: parsed });
              }

              return sendJson(404, { error: 'Unknown AI endpoint' });
            } catch (error: any) {
              console.error('Server AI endpoint failure:', error);
              return sendJson(500, { error: error.message || 'Internal server error in AI endpoint', isDemoMode: true });
            }
          });
        }
      }
    ],
    server: {
      port: 3009,
      strictPort: true,
      open: false
    }
  };
});

