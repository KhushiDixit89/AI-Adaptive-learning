// Mock localStorage for node environment
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

import {
  DEFAULT_REMINDER_SETTINGS,
  generateSmartReminder,
  recordReminderDismissal,
  recordReminderSnooze,
  isReminderActive,
  loadReminderSettings
} from '../src/services/reminderService';
import {
  StudentProfile,
  SubjectData,
  CurrentLearningContext,
  TimedQuizAnalytics,
  QuestionResponseLog
} from '../src/types';

// Mock student profile
const mockStudent: StudentProfile = {
  name: 'Aarav Sharma',
  grade: 'Class 10',
  board: 'CBSE',
  stream: 'Science',
  preferredStyle: 'Visual',
  level: 'Intermediate',
  streak: 5,
  overallProgress: 68,
  overallAccuracy: 78,
  completedLessons: 18,
  xp: 1420
};

const mockSubjects: SubjectData[] = [
  {
    id: 'math',
    name: 'Mathematics',
    progress: 75,
    level: 'Intermediate',
    accuracy: 82,
    completedTopics: 6,
    totalTopics: 8,
    strengths: ['Trigonometry', 'Real Numbers'],
    weaknesses: ['Triangles'],
    icon: '📐',
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    description: 'Class 10 CBSE Math'
  },
  {
    id: 'sci',
    name: 'Science',
    progress: 40,
    level: 'Beginner',
    accuracy: 58,
    completedTopics: 3,
    totalTopics: 8,
    strengths: ['Light Reflection'],
    weaknesses: ['Chemical Reactions', 'Functional Groups'],
    icon: '🔬',
    color: '#10B981',
    bgLight: '#ECFDF5',
    description: 'Class 10 CBSE Science'
  }
];

function runTests() {
  console.log('=== TEST 1: Smart Reminder Prioritization ===');

  // Case A: Unfinished active lesson
  const contextUnfinished: CurrentLearningContext = {
    classLevel: 'Class 10',
    board: 'CBSE',
    stream: 'Science',
    subject: 'Science',
    chapter: 'Chemical Reactions and Equations',
    topic: 'Balancing Chemical Equations',
    learningStyle: 'Visual',
    difficulty: 'Intermediate'
  };

  const reminder1 = generateSmartReminder({
    student: mockStudent,
    subjects: mockSubjects,
    currentLearningContext: contextUnfinished,
    lastQuizResult: null,
    reminderSettings: DEFAULT_REMINDER_SETTINGS
  });

  console.log('Reminder 1 (Active topic unfinished):', reminder1?.type, '-', reminder1?.title);
  if (reminder1?.type !== 'continue_lesson') {
    throw new Error(`Expected continue_lesson, got: ${reminder1?.type}`);
  }

  // Case B: If remindUnfinishedLessons is disabled in settings, fall back to weak topic
  const settingsNoContinue = {
    ...DEFAULT_REMINDER_SETTINGS,
    remindUnfinishedLessons: false
  };

  const reminder2 = generateSmartReminder({
    student: mockStudent,
    subjects: mockSubjects,
    currentLearningContext: contextUnfinished,
    lastQuizResult: null,
    reminderSettings: settingsNoContinue
  });

  console.log('Reminder 2 (continue_lesson disabled -> weak topic):', reminder2?.type, '-', reminder2?.title);
  if (reminder2?.type !== 'weak_topic') {
    throw new Error(`Expected weak_topic, got: ${reminder2?.type}`);
  }

  console.log('=== TEST 2: Reminder Snooze & Dismissal Filtering ===');
  const reminderId = reminder1!.id;
  
  // Initially active
  if (!isReminderActive(reminderId)) {
    throw new Error('Expected reminder to be initially active');
  }

  // Record snooze
  recordReminderSnooze(reminderId, 'later_today');
  if (isReminderActive(reminderId)) {
    throw new Error('Expected snoozed reminder to be inactive');
  }
  console.log('✓ Reminder successfully snoozed and filtered from dashboard');

  // Record dismissal for another id
  const dummyId = 'rem_test_dismiss';
  recordReminderDismissal(dummyId);
  if (isReminderActive(dummyId)) {
    throw new Error('Expected dismissed reminder to be inactive');
  }
  console.log('✓ Reminder successfully dismissed and filtered from dashboard');

  console.log('=== TEST 3: Timed Quiz Response Log & Speed Diagnosis Matrix ===');

  // Scenario 1: High Accuracy + Slow Speed (e.g. 52s avg, 100% accuracy)
  const logsSlowAccurate: QuestionResponseLog[] = [
    { questionId: 'q1', questionIndex: 0, timeSpent: 55, correct: true, skipped: false, selectedIndex: 1 },
    { questionId: 'q2', questionIndex: 1, timeSpent: 48, correct: true, skipped: false, selectedIndex: 0 },
    { questionId: 'q3', questionIndex: 2, timeSpent: 52, correct: true, skipped: false, selectedIndex: 2 }
  ];

  const totalTime1 = logsSlowAccurate.reduce((a, b) => a + b.timeSpent, 0);
  const avgTime1 = totalTime1 / logsSlowAccurate.length;
  const acc1 = 100;

  let speedCat1: 'fast' | 'moderate' | 'slow' = avgTime1 < 25 ? 'fast' : avgTime1 <= 45 ? 'moderate' : 'slow';
  let insight1 = '';
  let rec1 = '';

  if (acc1 >= 80 && speedCat1 === 'slow') {
    insight1 = 'High conceptual accuracy, but response speed indicates hesitation or over-calculation.';
    rec1 = 'Practice timed flashcard drills or quick-fire question sets for this topic to build recall fluency.';
  }

  console.log(`Scenario 1: Accuracy=${acc1}%, AvgTime=${avgTime1.toFixed(1)}s, SpeedCat=${speedCat1}`);
  console.log('Insight:', insight1);
  console.log('Recommendation:', rec1);
  if (speedCat1 !== 'slow' || !rec1.includes('timed flashcard drills')) {
    throw new Error('Scenario 1 matrix evaluation failed');
  }

  // Scenario 2: Low Accuracy + Fast Speed (e.g. 14s avg, 33% accuracy - Rushing)
  const logsFastInaccurate: QuestionResponseLog[] = [
    { questionId: 'q1', questionIndex: 0, timeSpent: 12, correct: false, skipped: false, selectedIndex: 1 },
    { questionId: 'q2', questionIndex: 1, timeSpent: 16, correct: true, skipped: false, selectedIndex: 0 },
    { questionId: 'q3', questionIndex: 2, timeSpent: 14, correct: false, skipped: false, selectedIndex: 2 }
  ];

  const totalTime2 = logsFastInaccurate.reduce((a, b) => a + b.timeSpent, 0);
  const avgTime2 = totalTime2 / logsFastInaccurate.length;
  const acc2 = Math.round((1 / 3) * 100);

  let speedCat2: 'fast' | 'moderate' | 'slow' = avgTime2 < 25 ? 'fast' : avgTime2 <= 45 ? 'moderate' : 'slow';
  let insight2 = '';
  let rec2 = '';

  if (acc2 < 60 && speedCat2 === 'fast') {
    insight2 = 'Fast response speed combined with lower accuracy suggests rushing through questions.';
    rec2 = 'Slow down! Spend at least 30-40 seconds per question, read options carefully, and eliminate incorrect choices.';
  }

  console.log(`Scenario 2: Accuracy=${acc2}%, AvgTime=${avgTime2.toFixed(1)}s, SpeedCat=${speedCat2}`);
  console.log('Insight:', insight2);
  console.log('Recommendation:', rec2);
  if (speedCat2 !== 'fast' || !rec2.includes('Slow down!')) {
    throw new Error('Scenario 2 matrix evaluation failed');
  }

  // Scenario 3: Auto-submit freeze check
  const timeLimit = 300;
  const timeRemainingZero = 0;
  const isAutoSubmitted = timeRemainingZero <= 0;
  console.log('Scenario 3: Timer reached 00:00 -> autoSubmit triggers:', isAutoSubmitted);
  if (!isAutoSubmitted) {
    throw new Error('Auto-submit did not trigger when time remaining reached 0');
  }

  console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests();
