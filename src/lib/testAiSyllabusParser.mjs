import { extractChaptersFromText, cleanExtractedText } from './aiSyllabusParser.js';

// Realistic syllabus text as extracted from a PDF (with line breaks and spacing)
const syllabusText = `
MATHEMATICS SYLLABUS

1. Introduction to Algebra
   Basic concepts, variables, expressions

2. Linear Equations
   Solving equations, applications

3. Quadratic Equations
   Factoring, quadratic formula, graphing

4. Geometry Basics
   Points, lines, angles, triangles

5. Statistics and Probability
   Data analysis, mean, median, mode

COURSE STRUCTURE:
- Total Hours: 120
- Marks Distribution: Theory 80, Practical 20
- Question Paper Design: Section A, B, C
- Prescribed Books: Mathematics Textbook Class 10
- Time Duration: 3 Hours

INTERNAL ASSESSMENT:
- Project Work: 10 Marks
- Practical Exam: 10 Marks

EXTERNAL EXAMINATION:
- Theory Paper: 80 Marks
`;

console.log('=== Testing Chapter Extraction with Realistic Syllabus Text ===');
console.log('Input text:');
console.log(syllabusText);

const cleaned = cleanExtractedText(syllabusText);
console.log('\nCleaned text:');
console.log(cleaned);

const chapters = extractChaptersFromText(cleaned);
console.log('\nExtracted chapters:');
console.log(chapters);

// Expected chapters
const expected = [
  'Introduction to Algebra',
  'Linear Equations',
  'Quadratic Equations',
  'Geometry Basics',
  'Statistics and Probability'
];

console.log('\nExpected chapters:');
console.log(expected);

// Check if extraction matches expected
const success = JSON.stringify(chapters.sort()) === JSON.stringify(expected.sort());
console.log(`\nTest ${success ? 'PASSED' : 'FAILED'}`);

if (!success) {
  console.log('Missing chapters:', expected.filter(ch => !chapters.includes(ch)));
  console.log('Extra chapters:', chapters.filter(ch => !expected.includes(ch)));
}