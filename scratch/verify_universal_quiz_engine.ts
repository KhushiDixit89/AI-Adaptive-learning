import { CURRICULUM_CHAPTERS } from '../src/data/curriculum';
import { getChapters } from '../src/services/curriculumService';
import {
  getQuizForTopic,
  calculateAdaptiveQuizTimer,
  determineStudentPace
} from '../src/services/quizEngine';
import { ClassLevel, BoardType, StreamType, SubjectType, CurrentLearningContext } from '../src/types';

console.log('====================================================');
console.log('GURUMITRA UNIVERSAL QUIZ ENGINE & CURRICULUM AUDIT');
console.log('====================================================\n');

let totalTopicsTested = 0;
let totalQuestionsGenerated = 0;
let failures = 0;
let leakageDetected = 0;

const classes: ClassLevel[] = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

const boards: BoardType[] = ['CBSE', 'ICSE', 'UP Board'];

console.log(`Auditing CURRICULUM_CHAPTERS count: ${CURRICULUM_CHAPTERS.length} chapters loaded.`);

// 1. Audit cross-class chapter isolation
console.log('\n--- 1. VERIFYING CLASS ISOLATION IN getChapters ---');
classes.forEach((grade) => {
  const mathChs = getChapters(grade, 'CBSE', 'Not applicable', 'Mathematics');
  const sciChs = getChapters(grade, 'CBSE', 'Not applicable', 'Science');

  const leakedMath = mathChs.filter((c) => c.classLevel !== grade);
  const leakedSci = sciChs.filter((c) => c.classLevel !== grade);

  if (leakedMath.length > 0 || leakedSci.length > 0) {
    console.error(`❌ LEAKAGE IN ${grade}: Math leaked ${leakedMath.length} chapters, Sci leaked ${leakedSci.length} chapters!`);
    failures++;
  } else {
    console.log(`✅ ${grade}: Math (${mathChs.length} chs), Science (${sciChs.length} chs) — Pure class isolation.`);
  }
});

// 2. Audit EVERY chapter and topic across the curriculum
console.log('\n--- 2. VERIFYING 100% TOPIC QUIZ AVAILABILITY ACROSS ALL CURRICULUM TOPICS ---');

const auditedKeys = new Set<string>();

CURRICULUM_CHAPTERS.forEach((ch) => {
  ch.topics.forEach((t) => {
    const key = `${ch.classLevel}|${ch.board}|${ch.subject}|${ch.title}|${t.title}`;
    if (auditedKeys.has(key)) return;
    auditedKeys.add(key);

    totalTopicsTested++;

    const context: CurrentLearningContext = {
      classLevel: ch.classLevel,
      board: ch.board,
      stream: ch.stream || 'Not applicable',
      subject: ch.subject as SubjectType,
      chapter: ch.title,
      chapterId: ch.id,
      topic: t.title,
      topicId: t.id,
      difficulty: t.difficulty,
      learningStyle: 'Simple'
    };

    const questions = getQuizForTopic(context);
    totalQuestionsGenerated += questions.length;

    // Check 1: Minimum question count
    if (!questions || questions.length < 3) {
      console.error(`❌ FAIL: Topic has fewer than 3 questions: ${key} (count: ${questions?.length || 0})`);
      failures++;
    }

    // Check 2: Cross-topic and cross-subject leakage verification
    const subClean = ch.subject.toLowerCase();
    const tClean = t.title.toLowerCase();

    questions.forEach((q) => {
      // Must not leak unrelated subject content
      if (subClean.includes('science') && !subClean.includes('computer')) {
        const qText = (q.question + ' ' + q.options.join(' ')).toLowerCase();
        if (qText.includes('binary tree') || qText.includes('cartesian coordinate') || qText.includes('pythagoras')) {
          console.error(`❌ SUBJECT LEAKAGE DETECTED in ${key}: Contains CS/Math content!`);
          leakageDetected++;
        }
      }

      if (subClean.includes('math') && !tClean.includes('geometry') && !tClean.includes('triangle')) {
        const qText = (q.question + ' ' + q.options.join(' ')).toLowerCase();
        if (tClean.includes('number') && qText.includes('triangle')) {
          console.error(`❌ TOPIC LEAKAGE DETECTED in ${key}: Number Systems contains Triangle!`);
          leakageDetected++;
        }
      }

      // Check option validity
      if (!q.options || q.options.length !== 4) {
        console.error(`❌ INVALID OPTIONS in ${key}: Question has ${q.options?.length} options instead of 4!`);
        failures++;
      }

      if (q.correctIndex < 0 || q.correctIndex > 3) {
        console.error(`❌ INVALID CORRECT INDEX in ${key}: ${q.correctIndex}`);
        failures++;
      }
    });
  });
});

console.log(`\nAudited ${totalTopicsTested} distinct curriculum topics.`);
console.log(`Total valid questions inspected: ${totalQuestionsGenerated}`);
console.log(`Failures: ${failures}, Leakages: ${leakageDetected}`);

// 3. Verify Adaptive Timer Engine
console.log('\n--- 3. VERIFYING ADAPTIVE TIMER CONFIGURATION ---');

const timerTestCases: {
  name: string;
  context: CurrentLearningContext;
  qCount: number;
  student: any;
  lastQuizResult: any;
  expectedMinPerQ: number;
  expectedMaxPerQ: number;
}[] = [
  {
    name: 'Class 6 Science Beginner (Normal pace)',
    context: {
      classLevel: 'Class 6',
      board: 'CBSE',
      stream: 'Not applicable',
      subject: 'Science',
      chapter: 'Components of Food',
      topic: 'Nutrients and Food Tests',
      difficulty: 'Beginner',
      learningStyle: 'Simple'
    },
    qCount: 5,
    student: { level: 'Intermediate', overallAccuracy: 75 },
    lastQuizResult: null,
    expectedMinPerQ: 45,
    expectedMaxPerQ: 60
  },
  {
    name: 'Class 12 Physics Advanced (Needs More Time pace)',
    context: {
      classLevel: 'Class 12',
      board: 'CBSE',
      stream: 'Science',
      subject: 'Physics',
      chapter: 'Electrostatics & Electric Charges',
      topic: 'Coulomb’s Law and Electric Field',
      difficulty: 'Advanced',
      learningStyle: 'Exam-oriented'
    },
    qCount: 5,
    student: { level: 'Beginner', overallAccuracy: 50 },
    lastQuizResult: {
      timedQuizAnalytics: { speedCategory: 'slow', averageResponseTime: 65 }
    },
    expectedMinPerQ: 100,
    expectedMaxPerQ: 120
  },
  {
    name: 'Class 9 Math Intermediate (Fast pace)',
    context: {
      classLevel: 'Class 9',
      board: 'CBSE',
      stream: 'Not applicable',
      subject: 'Mathematics',
      chapter: 'Number Systems',
      topic: 'Irrational Numbers and Decimal Expansions',
      difficulty: 'Intermediate',
      learningStyle: 'Simple'
    },
    qCount: 5,
    student: { level: 'Advanced', overallAccuracy: 90 },
    lastQuizResult: {
      timedQuizAnalytics: { speedCategory: 'fast', averageResponseTime: 22 }
    },
    expectedMinPerQ: 55,
    expectedMaxPerQ: 75
  }
];

timerTestCases.forEach((tc) => {
  const pace = determineStudentPace(tc.student, tc.lastQuizResult);
  const timer = calculateAdaptiveQuizTimer(tc.context, tc.qCount, tc.student, tc.lastQuizResult);

  console.log(`\nTest Case: ${tc.name}`);
  console.log(`  Pace Category: ${pace} (Multiplier: ${timer.breakdown.paceMultiplier})`);
  console.log(`  Per Question Seconds: ${timer.secondsPerQuestion}s (Range expected: ${tc.expectedMinPerQ}s - ${tc.expectedMaxPerQ}s)`);
  console.log(`  Total Seconds for ${tc.qCount} questions: ${timer.totalSeconds}s (${Math.floor(timer.totalSeconds / 60)}m ${timer.totalSeconds % 60}s)`);

  if (timer.secondsPerQuestion < tc.expectedMinPerQ || timer.secondsPerQuestion > tc.expectedMaxPerQ) {
    console.error(`❌ TIMER OUT OF RANGE for ${tc.name}!`);
    failures++;
  } else {
    console.log(`  ✅ Timer validated.`);
  }

  // Ensure strict clamping
  if (timer.secondsPerQuestion < 40 || timer.secondsPerQuestion > 120) {
    console.error(`❌ TIMER CLAMPING VIOLATED: ${timer.secondsPerQuestion}s!`);
    failures++;
  }
});

console.log('\n====================================================');
if (failures === 0 && leakageDetected === 0) {
  console.log('🏆 ALL AUDIT CHECKS PASSED PERFECTLY!');
  console.log('100% of tested topics across Classes 6-12 have valid quizzes.');
  console.log('Zero cross-topic/cross-class leakage detected.');
  console.log('Adaptive timer engine operating within exact pedagogical bounds.');
} else {
  console.error(`❌ AUDIT COMPLETED WITH ${failures} failures and ${leakageDetected} leakages.`);
  process.exit(1);
}
console.log('====================================================');
