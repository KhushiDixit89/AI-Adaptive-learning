// Automated Pipeline Test Suite for Pre-Assessment Rebuild
// Tests PDF line reconstruction, chapter extraction, hard subject boundaries, question validation, and balanced test generation.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  cleanExtractedText,
  isProseSentence,
  cleanChapterTitle,
  extractTableOfContents,
  extractChaptersFromText,
  extractTopicsFromContentSlice,
  getChapterBoundaries,
  splitInlineChapters
} from '../src/lib/aiSyllabusParser.ts';

import {
  reconstructPageTextFromItems
} from '../src/utils/pdfExtractor.ts';

import {
  buildAllowedContentMap,
  validateQuestion,
  validateAssessmentSession,
  computeChapterQuestionAllocations,
  generateCombinedQuestions,
  TARGET_PRE_ASSESSMENT_QUESTIONS,
  BANNED_BOILERPLATE_PHRASES
} from '../src/services/preAssessmentService.ts';

describe('1. PDF Text Extraction & Visual Coordinate Reconstruction', () => {
  test('should sort text items horizontally on the same Y baseline without word scrambling', () => {
    // Simulating PDF.js stream where words arrive out of visual order
    const rawItems = [
      { str: 'Systems', transform: [1, 0, 0, 1, 140, 700], width: 50, height: 12 },
      { str: 'Chapter', transform: [1, 0, 0, 1, 40, 700], width: 45, height: 12 },
      { str: '1:', transform: [1, 0, 0, 1, 90, 700], width: 15, height: 12 },
      { str: 'Number', transform: [1, 0, 0, 1, 110, 700], width: 40, height: 12 }
    ];

    const result = reconstructPageTextFromItems(rawItems);
    assert.match(result.text, /Chapter 1:\s*Number\s*Systems/);
    assert.equal(result.lines.length, 1);
  });

  test('should order lines vertically from top to bottom (descending Y coordinate)', () => {
    const rawItems = [
      { str: 'Second Line Content', transform: [1, 0, 0, 1, 50, 650], width: 100, height: 12 },
      { str: 'Top Line Header', transform: [1, 0, 0, 1, 50, 720], width: 100, height: 12 },
      { str: 'Third Line Footer', transform: [1, 0, 0, 1, 50, 580], width: 100, height: 12 }
    ];

    const result = reconstructPageTextFromItems(rawItems);
    assert.equal(result.lines[0], 'Top Line Header');
    assert.equal(result.lines[1], 'Second Line Content');
    assert.equal(result.lines[2], 'Third Line Footer');
  });

  test('should filter isolated page number footers at page bottom', () => {
    const rawItems = [
      { str: 'Main Chapter Heading', transform: [1, 0, 0, 1, 50, 700], width: 120, height: 14 },
      { str: '12', transform: [1, 0, 0, 1, 300, 30], width: 15, height: 10 } // isolated footer
    ];

    const result = reconstructPageTextFromItems(rawItems);
    assert.equal(result.lines.length, 1);
    assert.equal(result.lines[0], 'Main Chapter Heading');
  });
});

describe('2. Chapter Detection & Strict Source-of-Truth', () => {
  test('should consolidate two-line chapter headings into one chapter title', () => {
    const text = `
Chapter 1
Number Systems

Chapter 2
Polynomials
    `;
    const chapters = extractChaptersFromText(text, 'Mathematics');
    assert.ok(chapters.includes('Number Systems'), 'Should include Number Systems');
    assert.ok(chapters.includes('Polynomials'), 'Should include Polynomials');
    assert.equal(chapters.includes('Chapter 1'), false, 'Should not treat Chapter 1 as a separate chapter');
  });

  test('should detect numbered single-line chapters', () => {
    const text = `
1. Real Numbers
2. Polynomials
3. Pair of Linear Equations in Two Variables
4. Quadratic Equations
    `;
    const chapters = extractChaptersFromText(text, 'Mathematics');
    assert.equal(chapters.length, 4);
    assert.equal(chapters[0], 'Real Numbers');
    assert.equal(chapters[1], 'Polynomials');
  });

  test('should detect underlined headings', () => {
    const text = `
Chemical Reactions and Equations
--------------------------------
Acids, Bases and Salts
======================
    `;
    const chapters = extractChaptersFromText(text, 'Science');
    assert.ok(chapters.includes('Chemical Reactions and Equations'));
    assert.ok(chapters.includes('Acids, Bases and Salts'));
  });

  test('should reject textbook prose sentences from becoming chapters', () => {
    const prose = [
      'A rational number can be written in the form p/q, where p and q are integers.',
      'We have already seen that every composite number can be factored uniquely.',
      'Photosynthesis is the process by which green plants synthesize nutrients.',
      'Therefore, it follows that the roots are non-negative.'
    ];

    prose.forEach(sentence => {
      assert.equal(isProseSentence(sentence), true, `Sentence should be identified as prose: "${sentence}"`);
    });

    const chapters = extractChaptersFromText(prose.join('\n'), 'Science');
    assert.equal(chapters.length, 0, 'No prose sentences should be accepted as chapters');
  });

  test('should reject syllabus metadata, marks, guidelines, and examination blueprints', () => {
    const metadata = `
CENTRAL BOARD OF SECONDARY EDUCATION
Course Structure Class X (2024-25)
Time Allowed: 3 Hours
Maximum Marks: 80
Unit I: Number Systems (16 Periods) 06 Marks
Unit II: Algebra (36 Periods) 20 Marks
Prescribed Books: NCERT Publications
Internal Assessment: 20 Marks
Design of Question Paper
    `;
    const chapters = extractChaptersFromText(metadata, 'Mathematics');
    assert.ok(!chapters.includes('Time Allowed: 3 Hours'));
    assert.ok(!chapters.includes('Maximum Marks: 80'));
    assert.ok(!chapters.includes('Prescribed Books: NCERT Publications'));
    assert.ok(!chapters.includes('Internal Assessment: 20 Marks'));
  });

  test('should return empty array and NEVER invent chapters when text is empty', () => {
    const emptyChapters = extractChaptersFromText('', 'Mathematics');
    assert.deepEqual(emptyChapters, []);

    const whitespaceChapters = extractChaptersFromText('    \n   ', 'Science');
    assert.deepEqual(whitespaceChapters, []);
  });
});

describe('3. Chapter Boundary Slicing & Topic Grounding', () => {
  test('should compute accurate start and end offsets for document chapters', () => {
    const fullText = `
Chapter 1: Real Numbers
1.1 Euclid's Division Lemma
Fundamental Theorem of Arithmetic states that every composite number...

Chapter 2: Polynomials
2.1 Geometrical Meaning of Zeros of Polynomials
Relationship between zeros and coefficients of a polynomial...
    `;

    const boundaries = getChapterBoundaries(fullText, ['Real Numbers', 'Polynomials'], 'Mathematics');
    const ch1 = Object.values(boundaries).find(b => b.chapterName === 'Real Numbers');
    const ch2 = Object.values(boundaries).find(b => b.chapterName === 'Polynomials');

    assert.ok(ch1, 'Real Numbers boundary should exist');
    assert.ok(ch2, 'Polynomials boundary should exist');
    assert.ok(ch1.startOffset < ch2.startOffset, 'Chapter 1 should precede Chapter 2');
    assert.ok(ch1.contentSlice.includes('Euclid'), 'Chapter 1 slice should contain Euclid');
    assert.ok(ch2.contentSlice.includes('Geometrical'), 'Chapter 2 slice should contain Geometrical');
  });

  test('should extract real topics from chapter content slice and avoid boilerplate strings', () => {
    const slice = `
Chapter 1: Chemical Reactions and Equations
1.1 Chemical Equations
1.2 Types of Chemical Reactions
• Combination Reaction
• Decomposition Reaction
• Displacement Reaction
    `;
    const topics = extractTopicsFromContentSlice(slice, 'Chemical Reactions and Equations');
    assert.ok(topics.some(t => t.includes('Chemical Equations') || t.includes('Types of Chemical Reactions')));
    // Must NOT contain generic fake boilerplate phrases
    assert.ok(!topics.some(t => t.includes('Core Concepts') || t.includes('Properties & Formulas')));
  });
});

describe('4. Hard Boundary Enforcement on User Subject Selection', () => {
  const mockChaptersBySubject = {
    Mathematics: [
      { chapterId: 'ch_mat_1', chapterName: 'Number Systems', subject: 'Mathematics', topics: ['Irrational Numbers', 'Exponents'] },
      { chapterId: 'ch_mat_2', chapterName: 'Polynomials', subject: 'Mathematics', topics: ['Zeros of Polynomials', 'Factorisation'] },
      { chapterId: 'ch_mat_3', chapterName: 'Quadratic Equations', subject: 'Mathematics', topics: ['Roots', 'Discriminant'] }
    ],
    Science: [
      { chapterId: 'ch_sci_1', chapterName: 'Chemical Reactions and Equations', subject: 'Science', topics: ['Types of Reactions', 'Redox'] },
      { chapterId: 'ch_sci_2', chapterName: 'Life Processes', subject: 'Science', topics: ['Photosynthesis', 'Respiration'] },
      { chapterId: 'ch_sci_3', chapterName: 'Electricity', subject: 'Science', topics: ['Ohm\'s Law', 'Resistors'] }
    ]
  };

  test('when student selects "Mathematics" ONLY, ZERO Science questions appear', async () => {
    const selectedSubjects = ['Mathematics'];
    const { questions, allowedMap } = await generateCombinedQuestions(
      mockChaptersBySubject,
      selectedSubjects,
      'Class 10',
      TARGET_PRE_ASSESSMENT_QUESTIONS
    );

    assert.equal(questions.length, TARGET_PRE_ASSESSMENT_QUESTIONS);
    const mathCount = questions.filter(q => q.subject === 'Mathematics').length;
    const scienceCount = questions.filter(q => q.subject === 'Science').length;

    assert.equal(mathCount, TARGET_PRE_ASSESSMENT_QUESTIONS, 'All 30 questions must be Mathematics');
    assert.equal(scienceCount, 0, 'ZERO Science questions may appear when Math only is selected');

    // Run full session validation
    const sessionCheck = validateAssessmentSession(questions, allowedMap, TARGET_PRE_ASSESSMENT_QUESTIONS);
    assert.equal(sessionCheck.valid, true, `Validation failed: ${sessionCheck.reasons.join(', ')}`);
  });

  test('when student selects "Science" ONLY, ZERO Mathematics questions appear', async () => {
    const selectedSubjects = ['Science'];
    const { questions, allowedMap } = await generateCombinedQuestions(
      mockChaptersBySubject,
      selectedSubjects,
      'Class 10',
      TARGET_PRE_ASSESSMENT_QUESTIONS
    );

    assert.equal(questions.length, TARGET_PRE_ASSESSMENT_QUESTIONS);
    const scienceCount = questions.filter(q => q.subject === 'Science').length;
    const mathCount = questions.filter(q => q.subject === 'Mathematics').length;

    assert.equal(scienceCount, TARGET_PRE_ASSESSMENT_QUESTIONS, 'All 30 questions must be Science');
    assert.equal(mathCount, 0, 'ZERO Mathematics questions may appear when Science only is selected');

    const sessionCheck = validateAssessmentSession(questions, allowedMap, TARGET_PRE_ASSESSMENT_QUESTIONS);
    assert.equal(sessionCheck.valid, true, `Validation failed: ${sessionCheck.reasons.join(', ')}`);
  });

  test('when student selects "Mathematics + Science", questions are cleanly partitioned and interleaved', async () => {
    const selectedSubjects = ['Mathematics', 'Science'];
    const { questions, allowedMap } = await generateCombinedQuestions(
      mockChaptersBySubject,
      selectedSubjects,
      'Class 10',
      TARGET_PRE_ASSESSMENT_QUESTIONS
    );

    assert.equal(questions.length, TARGET_PRE_ASSESSMENT_QUESTIONS);
    const mathCount = questions.filter(q => q.subject === 'Mathematics').length;
    const scienceCount = questions.filter(q => q.subject === 'Science').length;

    assert.ok(mathCount >= 12 && mathCount <= 18, `Math questions should be balanced (~15), got ${mathCount}`);
    assert.ok(scienceCount >= 12 && scienceCount <= 18, `Science questions should be balanced (~15), got ${scienceCount}`);
    assert.equal(mathCount + scienceCount, TARGET_PRE_ASSESSMENT_QUESTIONS);

    const sessionCheck = validateAssessmentSession(questions, allowedMap, TARGET_PRE_ASSESSMENT_QUESTIONS);
    assert.equal(sessionCheck.valid, true, `Validation failed: ${sessionCheck.reasons.join(', ')}`);
  });
});

describe('5. Question Validation & Rejection of Corrupt or Out-of-Bounds Questions', () => {
  const allowedMap = buildAllowedContentMap(['Mathematics'], {
    Mathematics: [
      { chapterId: 'ch_mat_1', chapterName: 'Number Systems', subject: 'Mathematics', topics: ['Irrational Numbers'] }
    ]
  });

  test('valid question passes validation', () => {
    const validQ = {
      questionId: 'q_001',
      chapterId: 'ch_mat_1',
      chapterName: 'Number Systems',
      topic: 'Irrational Numbers',
      difficulty: 'easy',
      question: 'Which of the following is an irrational number?',
      options: ['22/7', '√2', '3.14', '0.5'],
      correctOption: 1,
      explanation: '√2 is irrational because its decimal expansion is non-terminating and non-recurring.',
      subject: 'Mathematics'
    };

    const res = validateQuestion(validQ, allowedMap);
    assert.equal(res.valid, true);
    assert.equal(res.reasons.length, 0);
  });

  test('question from unselected subject is STRICTLY REJECTED', () => {
    const foreignQ = {
      questionId: 'q_002',
      chapterId: 'ch_sci_1',
      chapterName: 'Chemical Reactions and Equations',
      topic: 'Types of Reactions',
      difficulty: 'easy',
      question: 'What type of reaction is 2Mg + O2 -> 2MgO?',
      options: ['Combination', 'Decomposition', 'Displacement', 'Double displacement'],
      correctOption: 0,
      explanation: 'Two substances combine to form a single product.',
      subject: 'Science' // VIOLATION: allowedMap only allows Mathematics
    };

    const res = validateQuestion(foreignQ, allowedMap);
    assert.equal(res.valid, false);
    assert.ok(res.reasons.some(r => r.includes('HARD BOUNDARY VIOLATION')));
  });

  test('question with duplicate options is REJECTED', () => {
    const dupOptionQ = {
      questionId: 'q_003',
      chapterId: 'ch_mat_1',
      chapterName: 'Number Systems',
      topic: 'Irrational Numbers',
      difficulty: 'easy',
      question: 'Which of the following is an irrational number?',
      options: ['√2', '√3', '√2', '√5'], // Duplicate '√2'
      correctOption: 0,
      explanation: 'Explanation text here for the problem.',
      subject: 'Mathematics'
    };

    const res = validateQuestion(dupOptionQ, allowedMap);
    assert.equal(res.valid, false);
    assert.ok(res.reasons.some(r => r.includes('duplicate options')));
  });

  test('question with banned boilerplate phrase is REJECTED', () => {
    const boilerplateQ = {
      questionId: 'q_004',
      chapterId: 'ch_mat_1',
      chapterName: 'Number Systems',
      topic: 'Irrational Numbers',
      difficulty: 'easy',
      question: 'What fundamental principle primarily defines this concept?', // Banned phrase
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOption: 0,
      explanation: 'Explanation text here for the problem.',
      subject: 'Mathematics'
    };

    const res = validateQuestion(boilerplateQ, allowedMap);
    assert.equal(res.valid, false);
    assert.ok(res.reasons.some(r => r.includes('banned boilerplate phrase')));
  });
});

describe('6. User Screenshot Issue Resolution & Quality Assurance', () => {
  test('inline chapter string from user screenshot is split into distinct chapters', () => {
    const rawInput = 'Quadratic , 2 - Integration,3- Statistic, 4- Probability';
    const split = splitInlineChapters(rawInput);
    assert.deepEqual(split, ['Quadratic', 'Integration', 'Statistic', 'Probability']);
  });

  test('chapters with legitimate conjunctions are NOT split', () => {
    const chemChapter = 'Acids, Bases and Salts';
    const split = splitInlineChapters(chemChapter);
    assert.deepEqual(split, ['Acids, Bases and Salts']);
  });

  test('generating assessment for user screenshot chapters produces zero boilerplate and zero duplicates', async () => {
    const userChapters = splitInlineChapters('Quadratic , 2 - Integration,3- Statistic, 4- Probability');
    const mockUserChapters = {
      Mathematics: userChapters.map((ch, idx) => ({
        chapterId: `ch_user_${idx + 1}`,
        chapterName: ch,
        subject: 'Mathematics',
        topics: [ch]
      })),
      Science: []
    };

    const { questions, allowedMap } = await generateCombinedQuestions(
      mockUserChapters,
      ['Mathematics'],
      'Class 10',
      TARGET_PRE_ASSESSMENT_QUESTIONS
    );

    assert.equal(questions.length, TARGET_PRE_ASSESSMENT_QUESTIONS);

    // Verify ZERO questions contain banned boilerplate phrases
    const allText = questions.map(q => `${q.question} ${q.options.join(' ')}`).join('\n').toLowerCase();
    for (const banned of BANNED_BOILERPLATE_PHRASES) {
      assert.equal(
        allText.includes(banned.toLowerCase()),
        false,
        `Assessment must not contain banned boilerplate: "${banned}"`
      );
    }

    // Verify full session passes validation with 0 duplicates
    const sessionCheck = validateAssessmentSession(questions, allowedMap, TARGET_PRE_ASSESSMENT_QUESTIONS);
    assert.equal(sessionCheck.valid, true, `Validation failed: ${sessionCheck.reasons.join(', ')}`);
  });
});

describe('7. User Provided Syllabus PDFs Extraction & Topic Mapping', () => {
  test('PDF 1 (Science) extracts all 14 chapters separated by unicode dashes', () => {
    const sciencePdfText = `
 1 ── Chemical Reactions and Equations
 2 ── Acids, Bases and Salts
 3 ── Metals and Non-metals
 4 ── Carbon and Its Compounds
 5 ── Life Processes
 6 ── Control and Coordination
 7 ── Reproduction
 8 ── Heredity
 9 ── Our Environment
 10 ── Light
 11 ─ Human Eye
 12 ─ Electricity
 13 ── Magnetic Effects
 14 ─ Sources of Energy
`;
    const chapters = extractChaptersFromText(sciencePdfText, 'Science');
    assert.equal(chapters.length, 14, `Expected 14 Science chapters, got ${chapters.length}: ${JSON.stringify(chapters)}`);
    assert.equal(chapters[0], 'Chemical Reactions and Equations');
    assert.equal(chapters[1], 'Acids, Bases and Salts');
    assert.equal(chapters[2], 'Metals and Non-metals');
    assert.equal(chapters[3], 'Carbon and Its Compounds');
    assert.equal(chapters[4], 'Life Processes');
    assert.equal(chapters[5], 'Control and Coordination');
    assert.equal(chapters[6], 'Reproduction');
    assert.equal(chapters[7], 'Heredity');
    assert.equal(chapters[8], 'Our Environment');
    assert.equal(chapters[9], 'Light');
    assert.equal(chapters[10], 'Human Eye');
    assert.equal(chapters[11], 'Electricity');
    assert.equal(chapters[12], 'Magnetic Effects');
    assert.equal(chapters[13], 'Sources of Energy');
  });

  test('PDF 2 (Mathematics) extracts all 14 chapters and sub-topics from symbol font bullets', () => {
    const mathPdfText = `
1 Real Numbers
\uF0B7 Fundamental Theorem of Arithmetic 
\uF0B7 Irrational numbers 
\uF0B7 Rational numbers and decimal expansions 
2 Polynomials
\uF0B7 Zeroes of a polynomial 
\uF0B7 Relationship between zeroes and coefficients 
\uF0B7 Division algorithm 
3 Pair of Linear Equations in Two Variables
\uF0B7 Graphical solution 
\uF0B7 Substitution method 
\uF0B7 Elimination method 
\uF0B7 Cross-multiplication method 
\uF0B7 Equations reducible to linear equations 
4 Quadratic Equations
\uF0B7 Standard form 
\uF0B7 Factorisation 
\uF0B7 Quadratic formula 
\uF0B7 Nature of roots 
\uF0B7 Relationship between roots and coefficients 
5 Arithmetic Progressions
\uF0B7 General term 
\uF0B7 Sum of first n terms 
\uF0B7 Applications 
6 Triangles
\uF0B7 Similar figures 
\uF0B7 Similarity of triangles 
\uF0B7 Basic Proportionality Theorem 
\uF0B7 Areas of similar triangles 
\uF0B7 Pythagoras theorem 
7 Coordinate Geometry
\uF0B7 Distance formula 
\uF0B7 Section formula 
\uF0B7 Area of triangle 
8 Introduction to Trigonometry
\uF0B7 Trigonometric ratios 
\uF0B7 Values of standard angles 
\uF0B7 Relationships between trigonometric ratios 
\uF0B7 Trigonometric identities 
9 Some Applications of Trigonometry
\uF0B7 Heights and distances 
\uF0B7 Angle of elevation 
\uF0B7 Angle of depression 
10 Circles
\uF0B7 Tangent to a circle 
\uF0B7 Properties of tangents 
\uF0B7 Tangent-related theorems 
11 Areas Related to Circles
\uF0B7 Circumference 
\uF0B7 Area of circle 
\uF0B7 Sector 
\uF0B7 Segment 
\uF0B7 Areas of combinations of plane figures 
12 Surface Areas and Volumes
\uF0B7 Cube and cuboid 
\uF0B7 Cylinder 
\uF0B7 Cone 
\uF0B7 Sphere
\uF0B7 Hemisphere 
\uF0B7 Combination of solids 
13 Statistics
\uF0B7 Mean 
\uF0B7 Median 
\uF0B7 Mode 
\uF0B7 Grouped data 
\uF0B7 Cumulative frequency 
\uF0B7 Graphical representation 
14 Probability
\uF0B7 Classical probability 
\uF0B7 Probability of an event 
\uF0B7 Experimental probability
`;
    const chapters = extractChaptersFromText(mathPdfText, 'Mathematics');
    assert.equal(chapters.length, 14, `Expected 14 Mathematics chapters, got ${chapters.length}: ${JSON.stringify(chapters)}`);
    assert.equal(chapters[0], 'Real Numbers');
    assert.equal(chapters[1], 'Polynomials');
    assert.equal(chapters[2], 'Pair of Linear Equations in Two Variables');
    assert.equal(chapters[3], 'Quadratic Equations');
    assert.equal(chapters[4], 'Arithmetic Progressions');
    assert.equal(chapters[5], 'Triangles');
    assert.equal(chapters[6], 'Coordinate Geometry');
    assert.equal(chapters[7], 'Introduction to Trigonometry');
    assert.equal(chapters[8], 'Some Applications of Trigonometry');
    assert.equal(chapters[9], 'Circles');
    assert.equal(chapters[10], 'Areas Related to Circles');
    assert.equal(chapters[11], 'Surface Areas and Volumes');
    assert.equal(chapters[12], 'Statistics');
    assert.equal(chapters[13], 'Probability');

    const boundaries = getChapterBoundaries(mathPdfText, chapters, 'Mathematics');
    const realNumbersTopics = boundaries['ch_mat_1']?.topics || [];
    assert.ok(realNumbersTopics.includes('Fundamental Theorem of Arithmetic'));
    assert.ok(realNumbersTopics.includes('Irrational numbers'));
  });
});

describe('8. Multi-Subject Large Chapter Selection Stability (31+ Chapters)', () => {
  test('generates exactly 30 questions across 31 chapters (Math 14, Science 5, English 12) with zero errors', async () => {
    const mathChs = Array.from({ length: 14 }, (_, i) => ({
      chapterId: `m_${i + 1}`,
      chapterName: `Math Unit ${i + 1}`,
      subject: 'Mathematics',
      topics: [`Topic M${i + 1}`]
    }));
    const sciChs = Array.from({ length: 5 }, (_, i) => ({
      chapterId: `s_${i + 1}`,
      chapterName: `Science Unit ${i + 1}`,
      subject: 'Science',
      topics: [`Topic S${i + 1}`]
    }));
    const engChs = Array.from({ length: 12 }, (_, i) => ({
      chapterId: `e_${i + 1}`,
      chapterName: `English Unit ${i + 1}`,
      subject: 'English',
      topics: [`Topic E${i + 1}`]
    }));

    const chaptersBySubject = {
      Mathematics: mathChs,
      Science: sciChs,
      English: engChs
    };

    const result = await generateCombinedQuestions(
      chaptersBySubject,
      ['Mathematics', 'Science', 'English'],
      'Class 10',
      TARGET_PRE_ASSESSMENT_QUESTIONS
    );

    assert.equal(result.questions.length, TARGET_PRE_ASSESSMENT_QUESTIONS);
    const sessionCheck = validateAssessmentSession(result.questions, result.allowedMap, TARGET_PRE_ASSESSMENT_QUESTIONS);
    assert.equal(sessionCheck.valid, true, `Expected valid session, got: ${sessionCheck.reasons.join(', ')}`);

    // Verify all 3 subjects got questions
    const mathCount = result.questions.filter(q => q.subject === 'Mathematics').length;
    const sciCount = result.questions.filter(q => q.subject === 'Science').length;
    const engCount = result.questions.filter(q => q.subject === 'English').length;

    assert.ok(mathCount > 0, 'Must have Math questions');
    assert.ok(sciCount > 0, 'Must have Science questions');
    assert.ok(engCount > 0, 'Must have English questions');
    assert.equal(mathCount + sciCount + engCount, TARGET_PRE_ASSESSMENT_QUESTIONS);
  });
});


