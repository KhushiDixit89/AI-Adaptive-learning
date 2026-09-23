// Test script to debug chapter extraction
const { cleanExtractedText, extractChaptersFromText } = require('./src/lib/aiSyllabusParser');

// Sample syllabus text that should contain real chapters
const sampleText = `
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

console.log('Testing chapter extraction...');
console.log('Input text:', sampleText);

const cleaned = cleanExtractedText(sampleText);
console.log('\nCleaned text:', cleaned);

const chapters = extractChaptersFromText(cleaned);
console.log('\nExtracted chapters:', chapters);

// Test with more realistic chapter patterns
const sampleText2 = `
CHAPTER 1: NUMBER SYSTEMS
Real numbers, irrational numbers, decimal expansion

CHAPTER 2: ALGEBRA
Polynomials, linear equations in two variables

CHAPTER 3: COORDINATE GEOMETRY
Distance formula, section formula, area of triangle

CHAPTER 4: GEOMETRY
Triangles, circles, constructions

CHAPTER 5: TRIGONOMETRY
Trigonometric ratios, identities, heights and distances

QUESTION PAPER DESIGN:
Time: 3 Hours
Max Marks: 80
`;

console.log('\n\nTesting with CHAPTER pattern...');
console.log('Input text:', sampleText2);

const cleaned2 = cleanExtractedText(sampleText2);
console.log('\nCleaned text:', cleaned2);

const chapters2 = extractChaptersFromText(cleaned2);
console.log('\nExtracted chapters:', chapters2);