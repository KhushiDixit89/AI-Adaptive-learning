import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { ParsedMaterial } from '../types';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Server-side fallback for PDF extraction: runs in Node.js where PDF.js has zero browser sandbox limitations
 */
async function extractPdfViaServerApi(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.byteLength; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength)) as any);
    }
    const base64 = btoa(binary);

    const res = await fetch('/api/ai/extract-pdf-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64 })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.text === 'string' && data.text.length > 20) {
        return data.text;
      }
    }
  } catch (err) {
    console.warn('Server-side PDF extractor fallback failed:', err);
  }
  return '';
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Fallback parser for extracting printable text from PDF ArrayBuffer
 * when Web Worker is unavailable.
 */
function extractTextFromPdfBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let text = '';
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = textDecoder.decode(bytes);

  // Match text objects BT ... ET or stream content in PDF
  const textBlocks: string[] = [];
  const btRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;

  while ((match = btRegex.exec(rawString)) !== null) {
    const block = match[0];
    // Extract strings inside parentheses (Text)
    const parenStrings = block.match(/\((.*?)\)/g);
    if (parenStrings) {
      const line = parenStrings
        .map((s) => s.slice(1, -1).replace(/\\([()\\])/g, '$1'))
        .filter((s) => s.length > 1 && !/^[\x00-\x1F]+$/.test(s))
        .join(' ');
      if (line.trim()) textBlocks.push(line.trim());
    }
  }

  if (textBlocks.length > 5) {
    text = textBlocks.join('\n');
  } else {
    // General printable ASCII heuristic
    const clean = rawString.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    const lines = clean
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 20 && !l.startsWith('%') && !l.includes('endobj'));
    text = lines.slice(0, 100).join('\n');
  }

  return text.trim();
}

/**
 * Extract raw text from various file formats
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. Plain text / Markdown / CSV / JSON
  if (['txt', 'text', 'md', 'markdown', 'csv', 'json', 'log'].includes(ext)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result.trim());
        } else {
          reject(new Error('Failed to read text file.'));
        }
      };
      reader.onerror = () => reject(new Error('Could not open file for reading.'));
      reader.readAsText(file);
    });
  }

  // 2. DOCX documents (via mammoth)
  if (ext === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      if (text.length > 0) return text;
      throw new Error('DOCX document contains no readable text.');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to parse DOCX file.');
    }
  }

  // 3. PDF documents (using local same-origin worker with server-side Node fallback)
  if (ext === 'pdf') {
    let fullText = '';

    // 3a. Browser PDF.js with local Vite same-origin worker
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;

      const extractedPages: string[] = [];
      const totalPages = Math.min(pdf.numPages, 50); // Read up to 50 pages safely

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item as any)?.str || '')
          .join(' ')
          .trim();
        if (pageText) {
          extractedPages.push(`[Section / Page ${pageNum}]\n${pageText}`);
        }
      }

      fullText = extractedPages.join('\n\n').trim();
    } catch (pdfErr) {
      console.warn('Browser PDF.js extraction error, calling server-side extractor fallback:', pdfErr);
    }

    // 3b. Server-side Node PDF extraction fallback (100% reliable)
    if (!fullText || fullText.length < 30) {
      const serverText = await extractPdfViaServerApi(file);
      if (serverText && serverText.trim().length >= 30) {
        fullText = serverText.trim();
      }
    }

    // 3c. Binary buffer scanner if offline / server endpoint unavailable
    if (!fullText || fullText.length < 30) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const fallbackText = extractTextFromPdfBuffer(arrayBuffer);
        if (fallbackText.length >= 30) {
          fullText = fallbackText;
        }
      } catch (fbErr) {
        console.error('PDF buffer fallback error:', fbErr);
      }
    }

    if (fullText && fullText.length >= 20) {
      return fullText;
    }

    throw new Error('Could not extract readable text from this PDF. Please ensure it is not an image-only scan.');
  }

  // 4. Default generic text reader fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result.trim());
      } else {
        reject(new Error(`Unsupported file format: .${ext}`));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}

/**
 * Intelligently analyzes extracted document text to dynamically extract
 * topics, sub-concepts, and a readable executive summary.
 */
export function extractTopicsFromText(
  text: string,
  fileName: string
): {
  summaryPreview: string;
  wordCount: number;
  topics: { title: string; concepts: string }[];
} {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Split into paragraphs / lines
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Look for potential headers/topics
  const potentialTopics: { title: string; concepts: string }[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const isHeading =
      line.startsWith('#') ||
      line.startsWith('Chapter') ||
      line.startsWith('Section') ||
      line.startsWith('Unit') ||
      /^\d+[\.\)]\s+[A-Z]/.test(line) ||
      (line.length < 65 && line.endsWith(':')) ||
      (line.length < 50 && line === line.toUpperCase() && !line.includes('.'));

    if (isHeading) {
      const cleanTitle = line.replace(/^[#\d\.\)\s]+/, '').replace(/:$/, '').trim();
      // Grab next 1-3 lines as sub-concepts
      const conceptLines = rawLines
        .slice(i + 1, i + 4)
        .filter((l) => !l.startsWith('#') && l.length > 10)
        .join(' ');

      if (cleanTitle.length > 3 && cleanTitle.length < 80) {
        potentialTopics.push({
          title: cleanTitle,
          concepts: conceptLines.slice(0, 140) || 'Key principles, definitions, and foundational explanations.'
        });
      }
    }
  }

  // If no explicit headings found, segment by paragraph blocks
  if (potentialTopics.length < 2) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 40);

    paragraphs.slice(0, 5).forEach((p, idx) => {
      const firstSentence = p.split(/[.?!]/)[0] || `Section ${idx + 1}`;
      const title = firstSentence.length > 55 ? firstSentence.slice(0, 52) + '...' : firstSentence;
      potentialTopics.push({
        title: title || `Topic Area ${idx + 1}`,
        concepts: p.slice(0, 140) + '...'
      });
    });
  }

  // Ensure fallback topics exist if document is brief
  if (potentialTopics.length === 0) {
    potentialTopics.push({
      title: `${fileName.replace(/\.[^/.]+$/, '')} Overview`,
      concepts: text.slice(0, 160) || 'General conceptual discussion and core study topics.'
    });
  }

  // Limit to top 5 distinct topics
  const finalTopics = potentialTopics.slice(0, 5);

  // Create preview summary
  const cleanFirstLines = rawLines.slice(0, 4).join(' ');
  const summaryPreview =
    cleanFirstLines.length > 220
      ? cleanFirstLines.slice(0, 217) + '...'
      : cleanFirstLines || `Material extracted from ${fileName}. Ready for AI-assisted tutoring and adaptive study.`;

  return {
    summaryPreview,
    wordCount,
    topics: finalTopics
  };
}

/**
 * End-to-end pipeline: takes a File, reads its text, extracts topics and metadata
 */
export async function processUploadedFile(file: File): Promise<ParsedMaterial> {
  const text = await extractTextFromFile(file);
  const analysis = extractTopicsFromText(text, file.name);

  return {
    id: `mat-${Date.now()}`,
    fileName: file.name,
    fileType: file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
    fileSize: file.size,
    fileSizeFormatted: formatBytes(file.size),
    extractedText: text,
    summaryPreview: analysis.summaryPreview,
    wordCount: analysis.wordCount,
    topics: analysis.topics,
    uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
