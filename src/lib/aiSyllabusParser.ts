// AI-Powered Syllabus Parser Service for Intelligent Chapter & Structure Extraction
import { SubjectType } from '../types';
import { mockCurriculum } from '../data/mockCurriculum';

// Interface for the parsed syllabus structure
export interface ParsedSyllabus {
  chapters: string[];
  rawText: string;
}

export interface ExtractedTocEntry {
  chapterNumber?: number;
  chapterTitle: string;
  startPage?: number;
  endPage?: number;
}

/**
 * Cleans and normalizes extracted PDF text
 * Removes artifacts, normalizes whitespace, and prepares for parsing
 */
export function cleanExtractedText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\([()\\])/g, '$1') // Unescape escaped parentheses
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ') // Normalize spaces and tabs
    .replace(/\n\s*\n\s*\n+/g, '\n\n') // Limit consecutive newlines
    .trim();
}

/**
 * Identifies whether a string is normal textbook prose rather than a chapter heading.
 * Prevents splitting sentences like "A rational number can be written in the form p/q, where p and q are integers."
 */
export function isProseSentence(str: string): boolean {
  const s = str.trim();
  if (!s) return true;

  // Ends with punctuation typical of sentences (. ? ;)
  if (/[.?;]$/.test(s)) return true;

  // Starts with a lowercase letter
  if (/^[a-z]/.test(s)) return true;

  // Word count check: chapter titles are rarely longer than 8 words
  const words = s.split(/\s+/);
  if (words.length > 8) return true;

  // Subordinate clauses, explanatory prose, and textbook statement markers
  const proseMarkers = [
    /\b(which is|where |such that|can be written|in the form|has two factors|is a prime|are called|is defined as)\b/i,
    /\b(we have|we know that|for example|let us|suppose that|therefore|because|since|if and only if|it follows that)\b/i,
    /\b(is|are|was|were|has|have|had|can|could|will|would|should|may|might)\s+(a|an|the|written|defined|known|called|expressed|given|used|found|seen|equal)\b/i,
    /^[•\-\*]?\s*(?:and|or|but|because|although|however|meanwhile|moreover|thus)\b/i,
    /\b(?:p\/q|f\(x\)|dy\/dx)\b/
  ];

  return proseMarkers.some(pattern => pattern.test(s));
}

/**
 * Detects and extracts structured Table of Contents (TOC) if present in the document.
 * Returns chapter titles, numbers, and page references strictly from the TOC block.
 */
export function extractTableOfContents(lines: string[]): ExtractedTocEntry[] {
  const tocEntries: ExtractedTocEntry[] = [];
  const seen = new Set<string>();

  // Look for TOC Header
  let tocStartIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 60); i++) {
    const line = lines[i].replace(/[:\-–—\s]+$/, '').trim();
    if (/^(?:table\s+of\s+contents|contents|index|syllabus\s+outline|table\s+des\s+matières)$/i.test(line)) {
      tocStartIndex = i + 1;
      break;
    }
  }

  if (tocStartIndex === -1) {
    return [];
  }

  // Scan lines within the TOC block (up to 40 lines or until major section boundary)
  for (let i = tocStartIndex; i < Math.min(lines.length, tocStartIndex + 45); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Boundary check: stop if we hit subsequent major body headers
    if (/^(?:unit\s+[0-9ivx]+|chapter\s+[0-9ivx]+|part\s+[0-9ivx]+)\s*[:\-–—]\s*/i.test(line) && i > tocStartIndex + 15) {
      // Could be the actual start of Chapter 1 in body
      if (/page\s*1\b|^1\s*$/i.test(lines[i + 1] || '')) break;
    }

    // Pattern A: "Chapter 1: Number Systems ........ 1-15" or "1. Number Systems ..... 1"
    const dottedMatch = line.match(/^(?:chapter|unit|lesson)?\s*([0-9]{1,2}|[IVX]{1,5})?[\.\:\)\-–—]?\s*(.+?)(?:[\.\s\-_~]{2,}|\s+p(?:age|\.)?\s*|\s+)(\d{1,3})(?:\s*[-–—]\s*\d{1,3})?\s*$/i);
    if (dottedMatch) {
      const numStr = dottedMatch[1];
      const titleCandidate = dottedMatch[2].replace(/[\.\-_~]+$/, '').trim();
      const pageStr = dottedMatch[3];

      if (!isProseSentence(titleCandidate) && titleCandidate.length >= 3 && titleCandidate.length <= 60) {
        const norm = titleCandidate.toLowerCase();
        if (!seen.has(norm)) {
          seen.add(norm);
          tocEntries.push({
            chapterNumber: numStr ? parseInt(numStr, 10) : undefined,
            chapterTitle: cleanChapterTitle(titleCandidate),
            startPage: pageStr ? parseInt(pageStr, 10) : undefined
          });
        }
        continue;
      }
    }

    // Pattern B: "Chapter 1 — Number Systems" or "1. Polynomials" without explicit dots
    const cleanLineMatch = line.match(/^(?:chapter|unit|lesson)\s*([0-9]{1,2}|[IVX]{1,5})?\s*[:\-–—,]\s*([A-Za-z][A-Za-z0-9\s&'\-–—]{2,55})$/i)
      || line.match(/^([0-9]{1,2})\.\s+([A-Za-z][A-Za-z0-9\s&'\-–—]{2,55})$/);
    if (cleanLineMatch) {
      const titleCandidate = cleanLineMatch[2].trim();
      if (!isProseSentence(titleCandidate) && titleCandidate.length >= 3) {
        const norm = titleCandidate.toLowerCase();
        if (!seen.has(norm)) {
          seen.add(norm);
          tocEntries.push({
            chapterNumber: cleanLineMatch[1] ? parseInt(cleanLineMatch[1], 10) : undefined,
            chapterTitle: cleanChapterTitle(titleCandidate)
          });
        }
      }
    }
  }

  return tocEntries;
}

/**
 * Cleans chapter title by stripping noise and formatting properly
 */
export function cleanChapterTitle(rawTitle: string): string {
  let clean = rawTitle
    .replace(/^(?:chapter|unit|module|lesson|section|part|theme)\s*(?:[0-9]+|[ivx]+)?\s*[:.,\-–—]?\s*/i, '')
    .replace(/^(?:[0-9]{1,2}|[IVX]{1,5})\s*[\.\)\]\-–—:,]\s*/i, '')
    .replace(/^[•\-\*▪►\s]+/, '')
    .replace(/\s*\(?\d+\s*(?:marks?|periods?|hours?|hrs?|pts?)\)?\s*$/i, '')
    .replace(/\s+\d{1,2}\s*$/, '')
    .replace(/[:.,\-–—]+$/, '')
    .trim();

  // If uppercase, capitalize words nicely
  if (clean === clean.toUpperCase() && clean.length > 4) {
    clean = clean
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  return clean;
}

/**
 * Extracts chapters strictly present in the uploaded document text.
 * NEVER adds chapters from external curriculum memory if document text is provided.
 */
export function extractChaptersFromText(text: string, subject?: SubjectType): string[] {
  // If no text was provided at all (cold start without file upload)
  if (!text || !text.trim()) {
    if (subject && mockCurriculum[subject]) {
      return [...mockCurriculum[subject].topics];
    }
    return [];
  }

  const cleaned = cleanExtractedText(text);
  const chapters: string[] = [];
  const seen = new Set<string>();

  // Filter out syllabus metadata, boilerplate, and instructions
  const metadataPatterns = [
    /\b(marks|weightage|weight|question paper|paper design|time allowed|maximum marks|max marks|total marks)\b/i,
    /\b(prescribed books?|reference books?|recommended books?|textbook|author|publisher)\b/i,
    /\b(course structure|course overview|learning outcomes|learning objectives|curriculum structure|general objectives)\b/i,
    /\b(internal assessment|external examination|theory paper|practical examination|project work|lab work)\b/i,
    /\b(evaluation scheme|assessment scheme|guidelines|general instructions|blueprint|design of question)\b/i,
    /\b(syllabus \d{4}|\bclass\s*[-–:]*\s*(?:ix|x|xi|xii|\d+)\b)/i,
    /\b(duration|hours|minutes|mins|periods?|term\s*[12i]+|semester\s*[12i]+)\b/i,
    /^page\s*\d+/i,
    /^[-_=\s*#~]+$/,
    /^\d+\s*$/,
    /^[ivxlcdm]+\s*$/i
  ];

  const tryAddChapter = (rawTitle: string): boolean => {
    const raw = rawTitle.trim();
    if (raw.length < 3 || raw.length > 80) return false;

    // Skip noise/artifacts
    if (/^(obj|endobj|xref|trailer|startxref|stream|endstream|PDF-\d|filter|flatedecode)/i.test(raw)) return false;
    if (metadataPatterns.some(pattern => pattern.test(raw))) return false;
    if (isProseSentence(raw)) return false;

    const clean = cleanChapterTitle(raw);
    if (clean.length < 3 || clean.length > 65) return false;
    if (/^[\d\W_]+$/.test(clean)) return false;
    if (metadataPatterns.some(pattern => pattern.test(clean))) return false;
    if (isProseSentence(clean)) return false;

    const normalized = clean.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);

    chapters.push(clean);
    return true;
  };

  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // =========================================================================
  // STAGE 1: Table of Contents (TOC) Extraction First
  // =========================================================================
  const tocEntries = extractTableOfContents(lines);
  if (tocEntries.length > 0) {
    // Verify each TOC entry against the document body
    const verifiedTocChapters: string[] = [];
    const bodyTextLower = cleaned.toLowerCase();

    for (const entry of tocEntries) {
      // Check if chapter appears elsewhere in body
      const titleLower = entry.chapterTitle.toLowerCase();
      const occurrences = (bodyTextLower.match(new RegExp(titleLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      if (occurrences >= 1) {
        verifiedTocChapters.push(entry.chapterTitle);
      }
    }

    if (verifiedTocChapters.length > 0) {
      return verifiedTocChapters;
    }
  }

  // =========================================================================
  // STAGE 2: Two-Line Chapter Heading Consolidation
  // Example:
  // Line i:   "Chapter 1"
  // Line i+1: "Number Systems"
  // Should produce ONE chapter: "Number Systems"
  // =========================================================================
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i];
    const next = lines[i + 1];

    if (/^\s*(?:chapter|unit|lesson|module|part)\s*(?:[0-9]+|[ivx]+)?\s*[:.,\-–—]?\s*$/i.test(current)) {
      if (next && !isProseSentence(next) && next.length >= 3 && next.length <= 60) {
        if (!metadataPatterns.some(p => p.test(next))) {
          if (tryAddChapter(next)) {
            i++; // Skip the next line since it was consumed as the title
          }
        }
      }
    }
  }

  // =========================================================================
  // STAGE 3: Underline Heading Detection
  // Example:
  // "Number Systems"
  // "--------------"
  // =========================================================================
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i];
    const next = lines[i + 1];
    if (/^[-=~_]{3,30}$/.test(next) && !isProseSentence(current)) {
      tryAddChapter(current);
    }
  }

  // =========================================================================
  // STAGE 4: Single-Line Explicit Chapter Patterns
  // Example: "Chapter 1: Number Systems", "1. Real Numbers", "Chapter 2, Polynomials"
  // =========================================================================
  const chapterPatterns = [
    /^\s*(?:chapter|unit|module|lesson|section|part|theme)\s*(?:[0-9]+|[ivx]+)?\s*[:.,\-–—]\s*(.+)$/i,
    /^\s*(?:[0-9]{1,2}|[IVX]{1,5})\s*[\.\)\]\-–—]\s*(.+)$/i,
    /^\s*([IVX]{1,5})\s+([A-Za-z][A-Za-z0-9\s,\-–—&']{3,60})/i,
    /^\s*[•\-\*▪►]\s+([A-Z][A-Za-z0-9\s,\-–—&']{3,60})$/,
    /^\s*([A-Z][A-Z0-9\s,\-–—&':]{3,55})$/
  ];

  for (const line of lines) {
    let matchedTitle = '';
    for (const pattern of chapterPatterns) {
      const match = line.match(pattern);
      if (match) {
        matchedTitle = (match[2] || match[1] || match[0]).trim();
        break;
      }
    }

    if (matchedTitle) {
      tryAddChapter(matchedTitle);
    }

    if (chapters.length >= 25) break;
  }

  // =========================================================================
  // STAGE 5: Explicit List Extraction ("Chapters: Number Systems, Polynomials...")
  // =========================================================================
  if (chapters.length === 0) {
    for (const line of lines) {
      const listMatch = line.match(/^(?:chapters?|units?|topics?\s*covered|syllabus\s*contents?)\s*[:\-]\s*(.+)$/i);
      if (listMatch) {
        const items = listMatch[1].split(',').map(s => s.trim());
        if (items.length >= 2 && items.every(item => item.length <= 40 && !isProseSentence(item))) {
          items.forEach(it => tryAddChapter(it));
        }
      }
    }
  }

  // =========================================================================
  // STAGE 6: Clean prominent standalone lines if still empty
  // STRICT RULE: Only extract from the text, NEVER add external curriculum
  // =========================================================================
  if (chapters.length === 0) {
    for (const line of lines) {
      if (line.length >= 4 && line.length <= 50 && /^[A-Z]/.test(line)) {
        if (!metadataPatterns.some(p => p.test(line)) && !isProseSentence(line)) {
          const clean = cleanChapterTitle(line);
          if (clean.length >= 4 && !seen.has(clean.toLowerCase())) {
            seen.add(clean.toLowerCase());
            chapters.push(clean);
            if (chapters.length >= 8) break;
          }
        }
      }
    }
  }

  // The PDF is the sole source of truth. Return ONLY what was found.
  return chapters;
}

/**
 * Extracts specific topics and concepts present under a specific chapter boundary in the document text.
 */
export function extractTopicsForChapter(
  chapterName: string,
  chapterIndex: number,
  allChapters: string[],
  fullText: string
): string[] {
  if (!fullText) return [`${chapterName} Fundamentals`, `${chapterName} Key Properties`, `${chapterName} Applications`];

  const lowerText = fullText.toLowerCase();
  const lowerChap = chapterName.toLowerCase();
  const nextChap = allChapters[chapterIndex + 1]?.toLowerCase();

  const startIdx = lowerText.indexOf(lowerChap);
  const endIdx = nextChap ? lowerText.indexOf(nextChap, startIdx + lowerChap.length) : -1;

  const sectionText = startIdx !== -1
    ? fullText.slice(startIdx, endIdx !== -1 ? endIdx : startIdx + 8000)
    : fullText;

  const lines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const extractedTopics: string[] = [];
  const seenTopics = new Set<string>();

  for (const line of lines) {
    // Look for subheadings: e.g. "1.1 Euclid's Division Lemma", "1.2 Fundamental Theorem of Arithmetic"
    const subMatch = line.match(/^(?:[0-9]{1,2}\.[0-9]{1,2}|•|\-)\s*([A-Za-z][A-Za-z0-9\s,\-–—&']{4,60})$/);
    if (subMatch) {
      const topicStr = subMatch[1].trim();
      if (!isProseSentence(topicStr) && !seenTopics.has(topicStr.toLowerCase())) {
        seenTopics.add(topicStr.toLowerCase());
        extractedTopics.push(topicStr);
        if (extractedTopics.length >= 6) break;
      }
    }
  }

  if (extractedTopics.length >= 2) {
    return extractedTopics;
  }

  // Fallback to grounded topics reflecting the chapter name
  return [
    `${chapterName} Core Concepts`,
    `${chapterName} Properties & Formulas`,
    `${chapterName} Analytical Applications`
  ];
}

/**
 * Main AI-powered syllabus parsing function
 * Orchestrates text cleaning and chapter extraction
 */
export function parseSyllabusWithAI(
  rawText: string,
  subject?: SubjectType
): ParsedSyllabus {
  const cleaned = cleanExtractedText(rawText);
  const chapters = extractChaptersFromText(cleaned, subject);

  return {
    chapters,
    rawText: cleaned
  };
}

/**
 * Fallback syllabus parse when no document text could be extracted
 */
export function getFallbackSyllabusParse(subject: SubjectType): ParsedSyllabus {
  const topics = mockCurriculum[subject]?.topics || ['Core Principles', 'Foundational Concepts'];
  return {
    chapters: topics,
    rawText: `Standard Curriculum for ${subject}\n\nChapters:\n` + topics.map((t, i) => `${i + 1}. ${t}`).join('\n')
  };
}

