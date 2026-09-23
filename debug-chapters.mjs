// Debug script to test PDF extraction
import { readFileSync } from 'fs';
import { cleanExtractedText, extractChaptersFromText } from './src/lib/aiSyllabusParser.js';

// Mock a simple PDF-like text for testing
const mockPdfText = `
CHAPTER 1: INTRODUCTION TO ALGEBRA
This chapter covers basic algebraic concepts, variables, and expressions.

CHAPTER 2: LINEAR EQUATIONS
Learn to solve linear equations and their applications.

CHAPTER 3: QUADRATIC EQUATIONS
Study quadratic equations, factoring, and graphing.

UNIT 4: GEOMETRY BASICS
Points, lines, angles, and basic geometric shapes.

MODULE 5: STATISTICS
Data collection, analysis, mean, median, mode.

COURSE STRUCTURE:
Total Hours: 120
Marks Distribution: Theory 80, Practical 20
`;

console.log('=== Testing Chapter Extraction ===');
console.log('Input text:');
console.log(mockPdfText);

const cleaned = cleanExtractedText(mockPdfText);
console.log('\nCleaned text:');
console.log(cleaned);

const chapters = extractChaptersFromText(cleaned);
console.log('\nExtracted chapters:');
console.log(chapters);

// Test with the actual fallback from pdfExtractor
import { parseFallbackChapters } from './src/utils/pdfExtractor.js';
const fallbackChapters = parseFallbackChapters(mockPdfText);
console.log('\nFallback chapters from pdfExtractor:');
console.log(fallbackChapters);