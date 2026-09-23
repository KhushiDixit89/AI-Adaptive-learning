// Native Browser PDF Text & Chapter Extractor using pdfjs-dist and coordinate-aware layout reconstruction
// Extracts readable, accurately ordered text streams from PDF files with preserved headings and lines.

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { cleanExtractedText, extractChaptersFromText } from '../lib/aiSyllabusParser';
import { SubjectType } from '../types';

// Configure same-origin local worker to prevent CORS and SecurityError in browsers
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface ExtractedSyllabus {
  rawText: string;
  pages?: ExtractedPage[];
  chapters: string[];
  extractionMethod?: 'pdfjs_browser' | 'server_node' | 'binary_stream' | 'none';
  extractionSuccess?: boolean;
}

export interface ExtractedPdfItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Reconstructs accurate lines and paragraphs from raw PDF.js text items
 * by clustering by vertical Y-coordinate and sorting horizontally by X-coordinate.
 */
export function reconstructPageTextFromItems(items: any[]): { text: string; lines: string[] } {
  if (!items || items.length === 0) {
    return { text: '', lines: [] };
  }

  // 1. Extract coordinates and normalize items
  const validItems: ExtractedPdfItem[] = [];
  for (const item of items) {
    if (typeof item?.str !== 'string') continue;
    const str = item.str;
    if (!str && str !== ' ') continue;

    const transform = item.transform || [1, 0, 0, 1, 0, 0];
    const x = transform[4] || 0;
    const y = transform[5] || 0;
    const height = Math.abs(transform[3]) || 12;
    const width = item.width || (str.length * (height * 0.5));

    validItems.push({ str, x, y, width, height });
  }

  if (validItems.length === 0) {
    return { text: '', lines: [] };
  }

  // 2. Sort items primarily by Y descending (top to bottom), then by X ascending (left to right)
  validItems.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 3) {
      return b.y - a.y; // Top to bottom
    }
    return a.x - b.x; // Left to right
  });

  // 3. Cluster into visual lines based on Y baseline proximity (tolerance ~3.5pt)
  const lineClusters: ExtractedPdfItem[][] = [];
  let currentCluster: ExtractedPdfItem[] = [];
  let currentY: number | null = null;

  for (const item of validItems) {
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
  if (currentCluster.length > 0) {
    lineClusters.push(currentCluster);
  }

  // 4. Sort each line's items strictly from left to right (X ascending) and build line strings
  const assembledLines: string[] = [];
  let prevLineY: number | null = null;
  let prevLineHeight = 12;

  for (const cluster of lineClusters) {
    cluster.sort((a, b) => a.x - b.x);

    let lineText = '';
    let prevItemEnd: number | null = null;

    for (const item of cluster) {
      if (item.str === '') continue;

      if (prevItemEnd !== null) {
        const gap = item.x - prevItemEnd;
        // If there's an actual horizontal space between tokens and neither ends/starts with space
        if (gap > 1.8 && !lineText.endsWith(' ') && !item.str.startsWith(' ')) {
          lineText += ' ';
        }
      }

      lineText += item.str;
      prevItemEnd = item.x + item.width;
    }

    const trimmedLine = lineText.trim();
    if (!trimmedLine) continue;

    // Filter isolated bottom page numbers (e.g. "12", "- 12 -", "Page 12 of 30")
    if (/^(?:page\s*)?\d+(?:\s*(?:of|\/)\s*\d+)?$/i.test(trimmedLine) && cluster[0].y < 45) {
      continue;
    }

    // Check if vertical distance from previous line indicates a section/paragraph break
    const clusterAvgY = cluster.reduce((sum, it) => sum + it.y, 0) / cluster.length;
    const avgHeight = cluster.reduce((sum, it) => sum + it.height, 0) / cluster.length || prevLineHeight;

    if (prevLineY !== null) {
      const verticalGap = prevLineY - clusterAvgY;
      if (verticalGap > avgHeight * 1.85 && assembledLines.length > 0) {
        assembledLines.push(''); // Blank separator line
      }
    }

    assembledLines.push(trimmedLine);
    prevLineY = clusterAvgY;
    prevLineHeight = avgHeight;
  }

  const pageText = assembledLines.join('\n');
  return {
    text: pageText,
    lines: assembledLines.filter(l => l.length > 0)
  };
}

/**
 * Server-side fallback for PDF extraction: runs in Node.js where PDF.js has zero browser sandbox limitations
 */
async function extractTextViaServerApi(file: File): Promise<{ text: string; pages?: ExtractedPage[] }> {
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
        return {
          text: data.text,
          pages: Array.isArray(data.pages) ? data.pages : undefined
        };
      }
    }
  } catch (err) {
    console.warn('Server-side PDF extractor fallback failed:', err);
  }
  return { text: '' };
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
        if (decoded.length > 2 && !/^(obj|endobj|xref|trailer|startxref|stream|endstream)/i.test(decoded)) {
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
      if (joined.length > 2 && !/^(obj|endobj|xref|trailer)/i.test(joined)) {
        lines.push(joined);
      }
    }

    return lines.join('\n');
  } catch {
    return '';
  }
}

/**
 * Extracts plain text from PDF using PDF.js with coordinate-aware line grouping,
 * section boundary detection, and reliable server-side fallback.
 */
export async function extractTextFromPDF(file: File, subject?: SubjectType): Promise<ExtractedSyllabus> {
  let fullText = '';
  const pages: ExtractedPage[] = [];
  let extractionMethod: 'pdfjs_browser' | 'server_node' | 'binary_stream' | 'none' = 'none';

  try {
    const arrayBuffer = await file.arrayBuffer();

    // 1. Client-Side PDF extraction with local same-origin worker & coordinate sorting
    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const { text: pageText, lines: pageLines } = reconstructPageTextFromItems(textContent.items as any[]);

        if (pageText.trim()) {
          pages.push({
            pageNumber: pageNum,
            text: pageText,
            lines: pageLines
          });
          fullText += `[Page ${pageNum}]\n${pageText}\n\n`;
        }
      }

      if (fullText.trim().length >= 30) {
        extractionMethod = 'pdfjs_browser';
      }
    } catch (pdfjsErr) {
      console.warn('Browser PDF.js extraction error, falling back to server-side parser:', pdfjsErr);
    }

    // 2. Server-side Node PDF extraction fallback (100% reliable for complex/compressed PDFs)
    if (!fullText.trim() || fullText.trim().length < 30) {
      const serverResult = await extractTextViaServerApi(file);
      if (serverResult.text && serverResult.text.trim().length >= 30) {
        fullText = serverResult.text;
        extractionMethod = 'server_node';
        if (serverResult.pages && serverResult.pages.length > 0) {
          pages.length = 0;
          pages.push(...serverResult.pages);
        }
      }
    }

    // 3. Binary buffer stream fallback if completely offline
    if (!fullText.trim()) {
      const binaryText = extractTextFromBinaryBuffer(arrayBuffer);
      if (binaryText.trim().length >= 30) {
        fullText = binaryText;
        extractionMethod = 'binary_stream';
      }
    }

    const cleanText = cleanExtractedText(fullText);
    const chapters = cleanText ? extractChaptersFromText(cleanText, subject) : [];

    return {
      rawText: cleanText,
      pages,
      chapters,
      extractionMethod,
      extractionSuccess: cleanText.length > 0 && chapters.length > 0
    };
  } catch (err) {
    console.warn('PDF extraction encountered an unrecoverable issue:', err);
    return {
      rawText: '',
      pages: [],
      chapters: [],
      extractionMethod: 'none',
      extractionSuccess: false
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
  parseTextIntoChapters,
  reconstructPageTextFromItems
};
