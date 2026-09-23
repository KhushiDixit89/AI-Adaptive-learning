// Test chapter extraction regex and logic directly
function cleanExtractedText(text) {
  return text
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

function extractChaptersFromText(text, subject) {
  if (!text || !text.trim()) return [];

  const cleaned = cleanExtractedText(text);
  let chapters = [];
  const seen = new Set();

  const chapterPatterns = [
    /^\s*(\d+)[\.\-\s]+(.+)$/,
    /^\s*(chapter|unit|module|section|part|lesson|topic)\s*[:\-\d\.]+\s*(.+)$/i,
    /^\s*([IVX]+)[\.\-\s]+(.+)$/i,
    /^\s*([A-Z][A-Z\s\-:]{3,50})$/,
    /^\s*(\d+)\)\s+(.+)$/,
    /^\s*(\d+\.\d+)[\.\-\s]+(.+)$/
  ];

  const tryAddChapter = (line) => {
    if (/^(obj|endobj|xref|trailer|startxref|stream|endstream|PDF-\d|filter|flatedecode|page\s*\d+)$/i.test(line)) return false;
    if (/^\d+$/.test(line)) return false;
    if (line.length < 3 || line.length > 150) return false;

    const metadataPatterns = [
      /marks/i, /weightage/i, /distribution/i, /question paper/i, /design/i,
      /time:/i, /hours/i, /minutes/i, /prescribed books/i, /reference books/i,
      /course structure/i, /learning objectives/i, /outcomes/i, /assessment/i,
      /evaluation/i, /internal/i, /external/i, /practical/i, /theory/i,
      /^page\s*\d+$/i, /^[-_=\s]*$/, /^\d+\s*$/, /^[ivxlcdm]+\s*$/i
    ];

    if (metadataPatterns.some(pattern => pattern.test(line))) return false;

    let cleanLine = line.trim();
    let matched = false;

    for (const pattern of chapterPatterns) {
      const match = cleanLine.match(pattern);
      if (match) {
        matched = true;
        // Take the title part
        cleanLine = match[match.length - 1] || cleanLine;
        break;
      }
    }

    if (!matched) return false;

    cleanLine = cleanLine
      .replace(/^(chapter|unit|module|section|part|lesson|topic)\s*[:\-\d\.]+\s*/i, '')
      .replace(/^(\d+)[\.\-\)]\s*/, '')
      .replace(/^([IVX]+)[\.\-\)]\s*/i, '')
      .replace(/^(\d+\.\d+)[\.\-\s]*/, '')
      .replace(/^[•\-\*\s]+/, '')
      .trim();

    if (cleanLine.length < 3 || /^[\d\W]+$/.test(cleanLine)) return false;

    const normalized = cleanLine.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    chapters.push(cleanLine);
    return true;
  };

  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines) {
    tryAddChapter(line);
  }

  return chapters;
}

const sample1 = `
MATHEMATICS SYLLABUS
1. Introduction to Algebra
2. Linear Equations in Two Variables
3. Quadratic Equations
4. Triangles and Circles
5. Trigonometric Identities
6. Statistics and Probability
`;

console.log('Sample 1 extracted:', extractChaptersFromText(sample1));

const sample2 = `
CHAPTER 1: NUMBER SYSTEMS
Real numbers and irrational numbers.
CHAPTER 2: POLYNOMIALS
Zeros of a polynomial and relationship between coefficients.
CHAPTER 3: COORDINATE GEOMETRY
Cartesian plane and coordinates.
UNIT 4: LINEAR EQUATIONS IN TWO VARIABLES
Standard form and graph of linear equations.
`;

console.log('Sample 2 extracted:', extractChaptersFromText(sample2));
