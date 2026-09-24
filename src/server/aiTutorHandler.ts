import OpenAI from 'openai';

declare const process: any;

export interface AITutorRequestBody {
  message?: string;
  question?: string;
  context?: {
    classLevel?: string | number;
    board?: string;
    stream?: string | null;
    subject?: string;
    chapter?: string;
    topic?: string;
    learningStyle?: string;
    difficulty?: string;
  };
  gradeLevel?: string | number;
  classLevel?: string | number;
  board?: string;
  stream?: string | null;
  subject?: string;
  chapter?: string;
  topic?: string;
  learningStyle?: string;
  difficulty?: string;
  conversation?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  uploadedContext?: {
    fileName: string;
    fileType: string;
    extractedText: string;
  } | null;
}

export interface StructuredTutorResponse {
  responseType?: 'conceptual' | 'mathematical' | 'programming' | 'document' | 'general' | string;
  crossSubjectNotice?: string;
  directAnswer: string;
  simpleExplanation: string;
  example?: string;
  stepByStep?: string[];
  analogy?: string;
  keyConcept: string;
  formulaOrCode?: string;
  codeExplanation?: string;
  complexity?: {
    time: string;
    space: string;
  };
  visualDiagram?: string;
  relevantContentFound?: string;
  documentReference?: string;
  followUpQuestions?: string[];
  practiceQuestion?: {
    question: string;
    options?: string[];
    answer: string;
  };
}

/**
 * Strips markdown code blocks and trims JSON
 */
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Extracts text from an OpenAI Responses API response object
 */
function extractTextFromResponse(res: any): string {
  if (typeof res?.output_text === 'string' && res.output_text) {
    return res.output_text;
  }
  if (Array.isArray(res?.output)) {
    for (const item of res.output) {
      if (item?.type === 'message' && Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (c?.type === 'output_text' && typeof c?.text === 'string') {
            return c.text;
          }
          if (typeof c?.text === 'string') {
            return c.text;
          }
        }
      }
    }
  }
  return '';
}

/**
 * Parses model JSON into the rich GuruMitra structured response format
 */
function parseModelJsonResponse(
  rawText: string,
  userQuestion: string,
  learningStyle: string
): StructuredTutorResponse {
  const cleaned = cleanJsonString(rawText);
  try {
    const parsed = JSON.parse(cleaned);
    return {
      responseType: parsed.responseType || 'conceptual',
      crossSubjectNotice: parsed.crossSubjectNotice || undefined,
      directAnswer: parsed.directAnswer || 'Here is your explanation:',
      simpleExplanation: parsed.simpleExplanation || rawText,
      example: parsed.example || undefined,
      stepByStep: Array.isArray(parsed.stepByStep) && parsed.stepByStep.length > 0 ? parsed.stepByStep : undefined,
      analogy: parsed.analogy || undefined,
      keyConcept: parsed.keyConcept || 'Core Academic Principle',
      formulaOrCode: parsed.formulaOrCode || undefined,
      codeExplanation: parsed.codeExplanation || undefined,
      complexity: parsed.complexity && typeof parsed.complexity === 'object' ? parsed.complexity : undefined,
      visualDiagram: parsed.visualDiagram || undefined,
      relevantContentFound: parsed.relevantContentFound || undefined,
      documentReference: parsed.documentReference || undefined,
      followUpQuestions: Array.isArray(parsed.followUpQuestions) && parsed.followUpQuestions.length > 0
        ? parsed.followUpQuestions
        : [
            `Can you give another example of this?`,
            `How does this apply to exams?`,
            `Test my understanding with another question`
          ],
      practiceQuestion: parsed.practiceQuestion && typeof parsed.practiceQuestion === 'object' && parsed.practiceQuestion.question
        ? {
            question: parsed.practiceQuestion.question,
            options: Array.isArray(parsed.practiceQuestion.options) ? parsed.practiceQuestion.options : undefined,
            answer: parsed.practiceQuestion.answer || 'Check above solution.'
          }
        : undefined
    };
  } catch (err) {
    // If model didn't return valid JSON, cleanly construct a structured response around the text
    console.warn('GuruMitra: Model did not return strict JSON, converting to structured format:', err);
    return {
      responseType: 'conceptual',
      directAnswer: rawText.slice(0, 200).split('\n')[0] || `Explanation for: "${userQuestion}"`,
      simpleExplanation: rawText,
      keyConcept: `${learningStyle} Mode Insight`,
      followUpQuestions: [
        'Explain this in more detail',
        'Give a real-world example',
        'Give me an exam practice question'
      ]
    };
  }
}

/**
 * Server-side AI Tutor Endpoint Handler
 */
export async function handleAITutorRequest(
  body: AITutorRequestBody,
  config: { apiKey?: string; model?: string }
): Promise<{ status: number; body: any }> {
  const rawMessage = (body.message || body.question || '').trim();
  if (!rawMessage) {
    return {
      status: 400,
      body: { error: 'Please enter a question.' }
    };
  }

  const apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
  if (!apiKey) {
    return {
      status: 503,
      body: {
        error: 'AI Tutor API is not configured. Add OPENAI_API_KEY to the server environment.',
        notConfigured: true
      }
    };
  }

  const ctx = body.context || {};
  const classLevel = ctx.classLevel || body.classLevel || body.gradeLevel || 'Class 9';
  const board = ctx.board || body.board || 'CBSE';
  const stream = ctx.stream !== undefined ? ctx.stream : (body.stream || 'Not applicable');
  const subject = ctx.subject || body.subject || 'General';
  const chapter = ctx.chapter || body.chapter || '';
  const topic = ctx.topic || body.topic || '';
  const learningStyle = ctx.learningStyle || body.learningStyle || 'Simple';
  const difficulty = ctx.difficulty || body.difficulty || 'Beginner';
  const model = config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Build educational pedagogical instructions
  const systemPrompt = `You are GuruMitra, an expert, encouraging, and highly adaptive educational AI tutor for school students in Class 6 to Class 12.

STUDENT ACADEMIC CONTEXT:
- Class / Grade: ${classLevel}
- Educational Board: ${board}
- Stream: ${stream || 'General'}
- Active Subject: ${subject}
${chapter ? `- Current Chapter: ${chapter}` : ''}
${topic ? `- Current Topic: ${topic}` : ''}
- Active Learning Style: ${learningStyle}
- Current Difficulty Level: ${difficulty}

TEACHING PHILOSOPHY & OBJECTIVES:
1. Explain concepts clearly, patiently, and accurately.
2. Be strictly age-appropriate:
   - For Class 6-8: use simple words, relatable everyday examples, avoid heavy jargon, keep sentences clear and encouraging.
   - For Class 9-10: balance intuition with proper academic terminology, scientific definitions, and standard mathematical steps.
   - For Class 11-12: provide conceptual depth, rigorous derivations, formal notation, and competitive exam readiness (CBSE/Board standards).
3. Respect Board Context (${board}):
   - Use standard curriculum definitions and conventions (e.g. NCERT for CBSE). Do not invent non-existent syllabus facts.
4. Genuine Multi-Subject Mastery:
   - You expertly tutor Mathematics, Science, Physics, Chemistry, Biology, Computer Science, English, Social Science (History, Civics, Geography), Economics, Accountancy, and Business Studies.
   - Respect the current subject context (${subject}).
   - OUT-OF-TOPIC QUESTIONS: If a student asks a question outside the current subject (e.g., student is in ${subject} and asks about photosynthesis or recursion), DO NOT REFUSE TO ANSWER. Be helpful! Provide a clear answer, and include a friendly "crossSubjectNotice" mentioning the relevant subject.
   - If a question is beyond their current class level, explain it simply at their level and kindly note that it is an advanced topic.

LEARNING STYLE ADAPTATION (CRITICAL - YOU MUST ADAPT TO "${learningStyle.toUpperCase()}"):
- Simple Mode:
  * Use plain, everyday language, short sentences, and step-by-step reasoning.
  * Avoid intimidating jargon; break complex concepts down into bite-sized ideas with friendly, relatable examples.
- Analogy Mode:
  * Center your explanation on a vivid, real-world analogy (e.g., comparing recursion to two facing mirrors, electric current to water flow in a pipe, cell nucleus to a school principal's office).
  * Use the analogy throughout the explanation to make the abstract concept tangible.
- Visual Mode:
  * Provide structured visual representations using text, ASCII diagrams, tables, bullet flows, and step-by-step directional arrows (e.g., Input -> Process -> Output).
  * Structure points with clear spatial layout and visual cues.
- Exam-oriented Mode:
  * Focus on exact definitions, key keywords that score marks in exams, formulas, derivations, common student mistakes/pitfalls, and exam tips.
  * Structure as: Definition, Key Points, Important Formula/Mechanism, Common Mistakes, Exam Tip.

QUESTION TYPE HANDLING:
- Math & Numerical Problems:
  Show: Given data -> Relevant Formula / Theorem -> Step-by-Step Calculation -> Final Answer with Units. Do not skip directly to the end.
- Programming & Computer Science:
  Provide: Concept Explanation -> Logic / Algorithm -> Clean, commented Code snippet (Python/C++/Java suitable for school syllabus) -> Expected Output -> Time/Space Complexity.
- Practice Question Requests (e.g., "Give me 5 questions..."):
  Provide a numbered list of high-quality, relevant practice questions matching their class level.
- Follow-up Questions:
  Understand references to earlier questions and answers (e.g., "explain step 2", "give another example").

RESPONSE FORMAT REQUIREMENT:
You MUST respond with ONLY a valid, parseable JSON object matching this schema:
{
  "directAnswer": "Concise, direct answer or summary addressing the student's question directly",
  "simpleExplanation": "Comprehensive explanation tailored specifically to the student's class, board, and ${learningStyle} mode",
  "example": "A concrete, relatable real-world example (optional but recommended when helpful)",
  "stepByStep": ["Step 1: ...", "Step 2: ..."],
  "analogy": "A real-world analogy (required for Analogy mode; optional for other modes)",
  "keyConcept": "1-2 sentences capturing the core takeaway / principle",
  "formulaOrCode": "Formula, equation, or code snippet if relevant (null if not applicable)",
  "codeExplanation": "Walkthrough of the code logic (null if not applicable)",
  "complexity": { "time": "e.g. O(log N)", "space": "e.g. O(1)" },
  "visualDiagram": "ASCII diagram, text flowchart, or structured visual layout (especially required for Visual mode, null if not needed)",
  "practiceQuestion": {
    "question": "A relevant quick-check practice question for the student",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct answer with brief solution"
  },
  "followUpQuestions": [
    "Suggested follow-up question 1",
    "Suggested follow-up question 2",
    "Suggested follow-up question 3"
  ],
  "crossSubjectNotice": "Optional note if question is outside ${subject} (null if same subject)"
}`;

  // Assemble recent conversation memory (cost-controlled to recent 6 messages)
  const inputItems: any[] = [];
  if (Array.isArray(body.conversation) && body.conversation.length > 0) {
    const recent = body.conversation.slice(-6);
    for (const msg of recent) {
      if (msg.content && msg.content.trim()) {
        inputItems.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content.slice(0, 1200)
        });
      }
    }
  }

  // Uploaded study material integration
  let userContent = rawMessage.slice(0, 2000);
  if (body.uploadedContext && body.uploadedContext.extractedText) {
    const snippet = body.uploadedContext.extractedText.slice(0, 4000);
    userContent = `[ATTACHED STUDY MATERIAL: "${body.uploadedContext.fileName}"]\n${snippet}\n\n[STUDENT QUESTION]\n${userContent}`;
  }

  inputItems.push({
    role: 'user',
    content: userContent
  });

  const client = new OpenAI({
    apiKey,
    timeout: 40000
  });

  let rawText = '';
  try {
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...inputItems
    ];
    const chatRes = await client.chat.completions.create({
      model,
      messages: chatMessages as any,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    rawText = chatRes.choices?.[0]?.message?.content || '';
  } catch (apiErr: any) {
    console.error('OpenAI API error:', apiErr?.status, apiErr?.message);
    return formatOpenAiError(apiErr, model);
  }

  if (!rawText) {
    return {
      status: 500,
      body: { error: 'Empty response received from OpenAI.' }
    };
  }

  const parsedData = parseModelJsonResponse(rawText, rawMessage, learningStyle);

  // If uploaded document context was provided, append reference metadata
  if (body.uploadedContext) {
    if (!parsedData.documentReference) {
      parsedData.documentReference = `Found in ${body.uploadedContext.fileName}`;
    }
  }

  return {
    status: 200,
    body: {
      success: true,
      data: parsedData
    }
  };
}

function formatOpenAiError(err: any, model: string): { status: number; body: any } {
  const status = err?.status || 500;
  if (status === 401 || status === 403) {
    return {
      status: 401,
      body: {
        error: 'OpenAI API authentication failed. Please verify your OPENAI_API_KEY in the server environment.'
      }
    };
  }
  if (status === 404 || err?.code === 'model_not_found') {
    return {
      status: 404,
      body: {
        error: `The configured OpenAI model "${model}" is unavailable for this API account. Please check OPENAI_MODEL.`
      }
    };
  }
  if (status === 429) {
    return {
      status: 429,
      body: {
        error: 'OpenAI quota or rate limit exceeded. Please check your account quota and billing.'
      }
    };
  }
  if (err?.code === 'ETIMEDOUT' || err?.name === 'AbortError' || err?.message?.includes('timeout')) {
    return {
      status: 504,
      body: {
        error: 'Request to AI Tutor timed out. Please try again.'
      }
    };
  }
  return {
    status: 500,
    body: {
      error: 'AI Tutor is temporarily unavailable. Please try again.'
    }
  };
}
