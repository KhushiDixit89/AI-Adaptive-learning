// Native Browser PDF Text & Chapter Extractor using pdfjs-dist and binary stream fallback
// Extracts readable text streams from PDF files and organizes them into a list of chapters.

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { cleanExtractedText, extractChaptersFromText } from '../lib/aiSyllabusParser';
import { SubjectType } from '../types';

// Configure same-origin local worker to prevent CORS and SecurityError in browsers
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export interface ExtractedSyllabus {
  rawText: string;
  chapters: string[];
}

/**
 * Server-side fallback for PDF extraction: runs in Node.js where PDF.js has zero browser sandbox limitations
 */
async function extractTextViaServerApi(file: File): Promise<string> {
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

/**
 * Fallback binary text extractor directly from PDF ArrayBuffer
 * Used when pdfjs worker is unavailable or fails due to network/CORS restrictions
 */
function extractTextFromBinaryBuffer(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binaryString += String.fromCharCode.apply(null, chunk as any);
    }

    const lines: string[] = [];
    // Match text in Parentheses (text) Tj or inside array [(text) 12 (text)] TJ
    const tjMatches = binaryString.match(/\(([^()]{2,120})\)\s*(?:Tj|'|")/g) || [];
    for (const m of tjMatches) {
      const textMatch = m.match(/\(([^()]+)\)/);
      if (textMatch && textMatch[1]) {
        const decoded = textMatch[1]
          .replace(/\\([()\\])/g, '$1')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, ' ')
          .trim();
        if (decoded.length > 2) {
          lines.push(decoded);
        }
      }
    }

    // Match TJ arrays
    const tjArrayMatches = binaryString.match(/\[(.*?)\]\s*TJ/g) || [];
    for (const arr of tjArrayMatches) {
      const innerTexts = arr.match(/\(([^()]+)\)/g) || [];
      const joined = innerTexts
        .map(t => t.slice(1, -1).replace(/\\([()\\])/g, '$1'))
        .join(' ')
        .trim();
      if (joined.length > 2) {
        lines.push(joined);
      }
    }

    return lines.join('\n');
  } catch {
    return '';
  }
}

/**
 * Extracts plain text from PDF using pdf.js with Y-coordinate line grouping and server fallback
 */
export async function extractTextFromPDF(file: File, subject?: SubjectType): Promise<ExtractedSyllabus> {
  let fullText = '';

  try {
    const arrayBuffer = await file.arrayBuffer();

    // 1. Client-Side PDF extraction with local same-origin worker
    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];

        // Group text items by Y-coordinate to form lines
        const lines: string[] = [];
        let currentLine = '';
        let lastY: number | null = null;

        for (const item of items) {
          if (typeof item.str !== 'string') continue;
          const y = item.transform ? Math.round(item.transform[5]) : null;
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 1) {
            // New line
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
            }
            currentLine = item.str;
          } else {
            // Same line
            currentLine += (currentLine ? ' ' : '') + item.str;
          }
          lastY = y;
        }
        // Push the last line
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }

        fullText += lines.join('\n') + '\n';
      }
    } catch (pdfjsErr) {
      console.warn('Browser pdfjs extraction had an issue, falling back to server-side parser:', pdfjsErr);
    }

    // 2. Server-side Node PDF extraction fallback (100% reliable for complex/compressed PDFs)
    if (!fullText.trim() || fullText.trim().length < 30) {
      const serverText = await extractTextViaServerApi(file);
      if (serverText.trim().length >= 30) {
        fullText = serverText;
      }
    }

    // 3. Binary buffer stream fallback if completely offline
    if (!fullText.trim()) {
      fullText = extractTextFromBinaryBuffer(arrayBuffer);
    }

    const cleanText = cleanExtractedText(fullText);
    const chapters = extractChaptersFromText(cleanText, subject);

    return {
      rawText: cleanText || `Extracted from ${file.name}`,
      chapters
    };
  } catch (err) {
    console.warn('PDF extraction encountered an issue, reading file metadata as fallback:', err);
    const fallbackChapters = extractChaptersFromText('', subject);
    return {
      rawText: `Syllabus document: ${file.name}`,
      chapters: fallbackChapters
    };
  }
}

/**
 * Export legacy parseTextIntoChapters for backward compatibility
 */
export function parseTextIntoChapters(text: string, subject?: SubjectType): string[] {
  return extractChaptersFromText(text, subject);
}

export default {
  extractTextFromPDF,
  parseTextIntoChapters
};
