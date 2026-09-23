// Comprehensive test for syllabus parsing patterns
import { mockCurriculum } from './src/data/mockCurriculum.js';

export function cleanExtractedText(text) {
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

export function extractChaptersFromText(text, subject) {
  if (!text || !text.trim()) {
    return mockCurriculum[subject]?.topics || [
      'Foundations and Principles',
      'Core Topics and Analysis',
      'Advanced Concepts',
      'Applications and Practice'
    ];
  }

  const cleaned = cleanExtractedText(text);
  const chapters = [];
  const seen = new Set();

  // Noise and metadata filter patterns
  const metadataPatterns = [
    /\b(marks|weightage|question paper|paper design|time allowed|maximum marks|max marks|total marks)\b/i,
    /\b(prescribed books?|reference books?|recommended books?|textbook|author)\b/i,
    /\b(course structure|course overview|learning outcomes|learning objectives|curriculum structure)\b/i,
    /\b(internal assessment|external examination|theory paper|practical examination|project work)\b/i,
    /\b(evaluation scheme|assessment scheme|guidelines|general instructions|blueprint)\b/i,
    /\b(table of contents|index|syllabus \d{4}|\bclass\s*[-–:]*\s*(?:ix|x|xi|xii|\d+)\b)/i,
    /^page\s*\d+/i,
    /^[-_=\s*#~]+$/,
    /^\d+\s*$/,
    /^[ivxlcdm]+\s*$/i
  ];

  // Regex patterns to identify chapter/unit header lines
  const chapterPatterns = [
    // Chapter/Unit/Module/Lesson/Part/Topic with optional number: "Chapter 1: Real Numbers", "Unit I - Algebra"
    /^\s*(?:chapter|unit|module|lesson|section|part|topic)\s*(?:[0-9]+|[ivx]+)?\s*[:.\-–—]\s*(.+)$/i,

    // Numbered with dot, dash or parenthesis: "1. Real Numbers", "1) Linear Equations", "1 - Algebra"
    /^\s*(?:[0-9]{1,2}|[IVX]{1,5})\s*[\.\)\]\-–—]\s*(.+)$/i,

    // Roman numeral followed by space and words: "I REAL NUMBERS", "IV GEOMETRY"
    /^\s*([IVX]{1,5})\s+([A-Z][A-Za-z0-9\s,\-–—&']{3,60})/i,

    // Bulleted items that look like chapter titles: "• Quadratic Equations"
    /^\s*[•\-\*▪►]\s+([A-Z][A-Za-z0-9\s,\-–—&']{3,60})$/,

    // ALL CAPS line that looks like a chapter: "QUADRATIC EQUATIONS", "CARBON AND ITS COMPOUNDS"
    /^\s*([A-Z][A-Z0-9\s,\-–—&':]{3,55})$/
  ];

  const tryAddChapter = (line) => {
    let raw = line.trim();
    if (raw.length < 3 || raw.length > 120) return false;

    // Reject artifact noise
    if (/^(obj|endobj|xref|trailer|startxref|stream|endstream|PDF-\d|filter|flatedecode|xref)/i.test(raw)) return false;

    // Check if whole line is just metadata
    if (metadataPatterns.some(p => p.test(raw))) return false;

    let matchedTitle = '';

    for (const pattern of chapterPatterns) {
      const match = raw.match(pattern);
      if (match) {
        // Take the captured group that holds the title
        matchedTitle = (match[2] || match[1] || match[0]).trim();
        break;
      }
    }

    if (!matchedTitle) return false;

    // Clean the extracted title
    let clean = matchedTitle
      // Remove leading Chapter/Unit prefixes if remaining
      .replace(/^(?:chapter|unit|module|lesson|section|part|topic)\s*(?:[0-9]+|[ivx]+)?\s*[:.\-–—]?\s*/i, '')
      // Remove leading numbers / Roman numerals / bullets
      .replace(/^(?:[0-9]{1,2}|[IVX]{1,5})\s*[\.\)\]\-–—:]\s*/i, '')
      .replace(/^[•\-\*▪►\s]+/, '')
      // Remove trailing marks / periods / hours / numbers e.g. "06", "10 Marks", "(20 Periods)"
      .replace(/\s*\(?\d+\s*(?:marks?|periods?|hours?|hrs?|pts?)\)?\s*$/i, '')
      .replace(/\s+\d{1,2}\s*$/, '') // Trailing mark number in tables like "Real Numbers 06"
      .replace(/[:.\-–—]+$/, '')
      .trim();

    // Secondary validation on cleaned title
    if (clean.length < 3 || clean.length > 70) return false;
    if (/^[\d\W_]+$/.test(clean)) return false; // Only numbers/symbols
    if (metadataPatterns.some(p => p.test(clean))) return false;

    // Deduplicate (case-insensitive)
    const norm = clean.toLowerCase();
    if (seen.has(norm)) return false;
    seen.add(norm);

    // Format title nicely (Capitalize properly if ALL CAPS)
    if (clean === clean.toUpperCase() && clean.length > 4) {
      clean = clean
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    chapters.push(clean);
    return true;
  };

  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // First pass: Try each line
  for (const line of lines) {
    tryAddChapter(line);
    if (chapters.length >= 25) break;
  }

  // Second pass: If still not enough chapters, check if text mentions standard curriculum topics for the subject
  if (chapters.length < 2 && subject && mockCurriculum[subject]) {
    const textLower = cleaned.toLowerCase();
    for (const topic of mockCurriculum[subject].topics) {
      if (textLower.includes(topic.toLowerCase())) {
        const norm = topic.toLowerCase();
        if (!seen.has(norm)) {
          seen.add(norm);
          chapters.push(topic);
        }
      }
    }
  }

  // Fallback: Use standard curriculum chapters for the subject, NEVER generic placeholder text
  if (chapters.length === 0) {
    if (subject && mockCurriculum[subject]) {
      return [...mockCurriculum[subject].topics];
    }
    return [
      'Foundations and Principles',
      'Core Topics and Analysis',
      'Advanced Concepts',
      'Applications and Practice'
    ];
  }

  return chapters;
}

// TEST CASES
const testCases = [
  {
    name: 'CBSE Class 10 Math Syllabus with Units & Marks',
    subject: 'Mathematics',
    text: `
COURSE STRUCTURE CLASS - X
Units Unit Name Marks
I NUMBER SYSTEMS 06
II ALGEBRA 20
III COORDINATE GEOMETRY 06
IV GEOMETRY 15
V TRIGONOMETRY 12
VI MENSURATION 10
VII STATISTICS & PROBABILITY 11
Total 80
INTERNAL ASSESSMENT 20
TOTAL 100
    `
  },
  {
    name: 'Numbered Chapters Format',
    subject: 'Mathematics',
    text: `
MATHEMATICS SYLLABUS
1. Real Numbers
2. Polynomials
3. Pair of Linear Equations in Two Variables
4. Quadratic Equations
5. Arithmetic Progressions
6. Triangles
7. Coordinate Geometry
8. Introduction to Trigonometry
9. Some Applications of Trigonometry
10. Circles
11. Constructions
12. Areas Related to Circles
13. Surface Areas and Volumes
14. Statistics
15. Probability
COURSE STRUCTURE:
Total Hours: 120
Marks Distribution: Theory 80, Practical 20
    `
  },
  {
    name: 'Chapter headers with colon and all caps',
    subject: 'Science',
    text: `
CHAPTER 1: CHEMICAL REACTIONS AND EQUATIONS
Chemical equation, Balanced chemical equation.
CHAPTER 2: ACIDS, BASES AND SALTS
Definitions in terms of furnishing of H+ and OH- ions.
CHAPTER 3: METALS AND NON-METALS
Properties of metals and non-metals.
CHAPTER 4: CARBON AND ITS COMPOUNDS
Covalent bonding in carbon compounds.
CHAPTER 5: LIFE PROCESSES
Basic concepts of nutrition, respiration, transport and excretion in plants and animals.
CHAPTER 6: CONTROL AND COORDINATION
Tropic movements in plants; Introduction to plant hormones.
    `
  },
  {
    name: 'Unstructured text mentioning curriculum topics',
    subject: 'Computer Science',
    text: `
The course will cover data structures in depth. Students will learn about Arrays, Linked Lists,
Stacks and Queues, along with Trees. We will also implement Sorting Algorithms and Searching Algorithms
using Python Basics and Object-Oriented Programming principles.
    `
  }
];

console.log('=== RUNNING TESTS ===\n');
for (const tc of testCases) {
  console.log(`--- Test: ${tc.name} (${tc.subject}) ---`);
  const result = extractChaptersFromText(tc.text, tc.subject);
  console.log('Extracted Chapters:', result);
  console.log(`Count: ${result.length}\n`);
}
