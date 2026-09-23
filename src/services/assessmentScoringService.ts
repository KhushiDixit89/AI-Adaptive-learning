import {
  PreAssessmentQuestion,
  PreAssessmentResult,
  QuestionPerformanceRecord,
  LearningGapItem,
  LearningLevelCategory,
  RecommendedNextAction,
  PreAssessmentDifficulty,
  SubjectType
} from '../types';

// ============================================================================
// CONFIGURABLE SCORING CONSTANTS
// ============================================================================

export const EXPECTED_TIMES_SECONDS: Record<PreAssessmentDifficulty, number> = {
  easy: 45,
  moderate: 75,
  difficult: 120
};

export const WEIGHT_KNOWLEDGE = 0.8;
export const WEIGHT_TIME_EFFICIENCY = 0.2;

export const GAP_THRESHOLDS = {
  highPriorityMax: 49.9,  // < 50%
  needsPracticeMax: 69.9, // 50% - 70%
  developingMax: 84.9,    // 70% - 85%
  strongMin: 85.0         // >= 85%
};

/**
 * Maps diagnostic percentage to student learning level
 */
export function calculateLearningLevel(overallScore: number): LearningLevelCategory {
  if (overallScore <= 30) return 'Needs Foundation';
  if (overallScore <= 50) return 'Beginner';
  if (overallScore <= 70) return 'Developing';
  if (overallScore <= 85) return 'Proficient';
  return 'Strong';
}

/**
 * Normalizes question response time so student is never severely penalized
 * for thoughtfully solving difficult questions.
 */
export function calculateQuestionTimeEfficiency(
  timeSpentSeconds: number,
  difficulty: PreAssessmentDifficulty
): number {
  const expected = EXPECTED_TIMES_SECONDS[difficulty] || 60;
  if (timeSpentSeconds <= expected) {
    return 100;
  }
  const excessRatio = (timeSpentSeconds - expected) / expected;
  // Soft decay capped at minimum 40% efficiency
  return Math.max(40, Math.round(100 - excessRatio * 30));
}

// Known prerequisite relationships across Indian and foundational curricula
const KNOWN_PREREQUISITES: Record<string, string> = {
  'Quadratic Equations': 'Factorisation & Algebraic Expressions',
  'Zeros of Polynomials': 'Linear Equations & Factorisation',
  'Polynomials': 'Algebraic Identities & Exponents',
  'Linear Equations': 'Arithmetic & Basic Operations',
  'Trigonometry': 'Similar Triangles & Pythagoras Theorem',
  'Coordinate Geometry': 'Number Line & Linear Equations',
  'Surface Areas and Volumes': 'Mensuration & 2D Geometry',
  'Chemical Reactions and Equations': 'Valency, Atoms and Molecules',
  'Acids, Bases and Salts': 'Chemical Bonding & Indicators',
  'Metals and Non-metals': 'Periodic Table & Electron Configuration',
  'Electricity': 'Atomic Structure & Charges',
  'Light - Reflection and Refraction': 'Rectilinear Propagation of Light',
  'Heredity and Evolution': 'Cell Division & DNA Basics',
  'Life Processes': 'Basic Cell Biology & Nutrition',
  'Tenses & Modals': 'Basic Subject-Verb Agreement',
  'Direct and Indirect Speech': 'Sentence Types and Tenses'
};

/**
 * Deterministically evaluates a completed assessment session
 */
export function evaluateAssessmentSession(
  studentId: string,
  questions: PreAssessmentQuestion[],
  answers: Record<string, { selectedOption: number | null; timeSpentSeconds: number }>,
  totalTestDurationSeconds: number,
  isDemoMode: boolean = false
): PreAssessmentResult {
  const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const totalQuestions = questions.length;

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let sumTimeEfficiency = 0;

  const questionRecords: QuestionPerformanceRecord[] = [];

  // Difficulty aggregators
  const diffStats: Record<PreAssessmentDifficulty, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 },
    moderate: { correct: 0, total: 0 },
    difficult: { correct: 0, total: 0 }
  };

  // Chapter aggregators
  const chapterStats: Record<string, {
    chapterName: string;
    subject: SubjectType;
    correct: number;
    total: number;
    easyCorrect: number;
    easyTotal: number;
    modCorrect: number;
    modTotal: number;
    diffCorrect: number;
    diffTotal: number;
  }> = {};

  // Topic aggregators
  const topicStats: Record<string, {
    topicName: string;
    chapterName: string;
    subject: SubjectType;
    correct: number;
    total: number;
    evidence: {
      questionIndex: number;
      questionText: string;
      difficulty: PreAssessmentDifficulty;
      isCorrect: boolean;
      userAnswerText?: string;
      correctAnswerText?: string;
    }[];
  }> = {};

  questions.forEach((q, index) => {
    const userAns = answers[q.questionId] || { selectedOption: null, timeSpentSeconds: 0 };
    const isAnswered = userAns.selectedOption !== null && userAns.selectedOption !== undefined;
    const isCorrect = isAnswered && userAns.selectedOption === q.correctOption;

    if (!isAnswered) {
      unansweredCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    const expectedTime = EXPECTED_TIMES_SECONDS[q.difficulty] || 60;
    const timeSpent = userAns.timeSpentSeconds || 0;
    const efficiency = calculateQuestionTimeEfficiency(timeSpent, q.difficulty);
    sumTimeEfficiency += efficiency;

    // Record question
    questionRecords.push({
      questionId: q.questionId,
      chapterId: q.chapterId,
      chapterName: q.chapterName,
      topic: q.topic,
      subject: q.subject,
      difficulty: q.difficulty,
      selectedOption: userAns.selectedOption,
      correctOption: q.correctOption,
      isCorrect,
      timeSpentSeconds: timeSpent,
      expectedTimeSeconds: expectedTime,
      questionText: q.question,
      options: q.options,
      explanation: q.explanation
    });

    // Update Difficulty stats
    diffStats[q.difficulty].total += 1;
    if (isCorrect) diffStats[q.difficulty].correct += 1;

    // Update Chapter stats
    if (!chapterStats[q.chapterId]) {
      chapterStats[q.chapterId] = {
        chapterName: q.chapterName,
        subject: q.subject,
        correct: 0,
        total: 0,
        easyCorrect: 0,
        easyTotal: 0,
        modCorrect: 0,
        modTotal: 0,
        diffCorrect: 0,
        diffTotal: 0
      };
    }
    chapterStats[q.chapterId].total += 1;
    if (isCorrect) chapterStats[q.chapterId].correct += 1;

    if (q.difficulty === 'easy') {
      chapterStats[q.chapterId].easyTotal += 1;
      if (isCorrect) chapterStats[q.chapterId].easyCorrect += 1;
    } else if (q.difficulty === 'moderate') {
      chapterStats[q.chapterId].modTotal += 1;
      if (isCorrect) chapterStats[q.chapterId].modCorrect += 1;
    } else if (q.difficulty === 'difficult') {
      chapterStats[q.chapterId].diffTotal += 1;
      if (isCorrect) chapterStats[q.chapterId].diffCorrect += 1;
    }

    // Update Topic stats
    const topicKey = `${q.chapterId}_${q.topic}`;
    if (!topicStats[topicKey]) {
      topicStats[topicKey] = {
        topicName: q.topic,
        chapterName: q.chapterName,
        subject: q.subject,
        correct: 0,
        total: 0,
        evidence: []
      };
    }
    topicStats[topicKey].total += 1;
    if (isCorrect) topicStats[topicKey].correct += 1;
    topicStats[topicKey].evidence.push({
      questionIndex: index + 1,
      questionText: q.question,
      difficulty: q.difficulty,
      isCorrect,
      userAnswerText: isAnswered ? q.options[userAns.selectedOption!] : 'Unanswered',
      correctAnswerText: q.options[q.correctOption]
    });
  });

  // Calculate Scores
  const knowledgeScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const timeEfficiencyScore = totalQuestions > 0 ? Math.round(sumTimeEfficiency / totalQuestions) : 0;
  const overallScore = Math.round(knowledgeScore * WEIGHT_KNOWLEDGE + timeEfficiencyScore * WEIGHT_TIME_EFFICIENCY);
  const learningLevel = calculateLearningLevel(overallScore);

  // Difficulty performance
  const difficultyPerformance = {
    easy: {
      correct: diffStats.easy.correct,
      total: diffStats.easy.total,
      accuracy: diffStats.easy.total > 0 ? Math.round((diffStats.easy.correct / diffStats.easy.total) * 100) : 0
    },
    moderate: {
      correct: diffStats.moderate.correct,
      total: diffStats.moderate.total,
      accuracy: diffStats.moderate.total > 0 ? Math.round((diffStats.moderate.correct / diffStats.moderate.total) * 100) : 0
    },
    difficult: {
      correct: diffStats.difficult.correct,
      total: diffStats.difficult.total,
      accuracy: diffStats.difficult.total > 0 ? Math.round((diffStats.difficult.correct / diffStats.difficult.total) * 100) : 0
    }
  };

  // Chapter performance
  const chapterPerformance: PreAssessmentResult['chapterPerformance'] = {};
  Object.entries(chapterStats).forEach(([chId, stats]) => {
    chapterPerformance[chId] = {
      chapterName: stats.chapterName,
      subject: stats.subject,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      total: stats.total,
      correct: stats.correct,
      easyAccuracy: stats.easyTotal > 0 ? Math.round((stats.easyCorrect / stats.easyTotal) * 100) : 0,
      moderateAccuracy: stats.modTotal > 0 ? Math.round((stats.modCorrect / stats.modTotal) * 100) : 0,
      difficultAccuracy: stats.diffTotal > 0 ? Math.round((stats.diffCorrect / stats.diffTotal) * 100) : 0
    };
  });

  // Topic performance & Knowledge Gap identification
  const topicPerformance: PreAssessmentResult['topicPerformance'] = {};
  const identifiedGaps: LearningGapItem[] = [];
  const strengths: string[] = [];

  Object.entries(topicStats).forEach(([key, tStat]) => {
    const accuracy = tStat.total > 0 ? Math.round((tStat.correct / tStat.total) * 100) : 0;
    const incorrectCount = tStat.total - tStat.correct;

    topicPerformance[key] = {
      topicName: tStat.topicName,
      chapterName: tStat.chapterName,
      subject: tStat.subject,
      accuracy,
      total: tStat.total,
      correct: tStat.correct
    };

    if (accuracy >= GAP_THRESHOLDS.strongMin) {
      strengths.push(`${tStat.topicName} (${tStat.chapterName})`);
    } else {
      // Prioritize priority: High Priority if accuracy < 50%, or multiple errors
      let priority: LearningGapItem['priority'] = 'Needs Practice';
      if (accuracy <= GAP_THRESHOLDS.highPriorityMax || incorrectCount >= 2) {
        priority = 'High Priority';
      } else if (accuracy <= GAP_THRESHOLDS.needsPracticeMax) {
        priority = 'Needs Practice';
      } else {
        priority = 'Developing';
      }

      const prereq = KNOWN_PREREQUISITES[tStat.chapterName] || KNOWN_PREREQUISITES[tStat.topicName];

      identifiedGaps.push({
        id: `gap_${key}`,
        subject: tStat.subject,
        chapterId: key.split('_')[0],
        chapterName: tStat.chapterName,
        topic: tStat.topicName,
        priority,
        accuracy,
        totalQuestions: tStat.total,
        incorrectQuestions: incorrectCount,
        evidence: tStat.evidence,
        prerequisite: prereq
      });
    }
  });

  // Sort gaps by severity (High Priority first, then lowest accuracy)
  identifiedGaps.sort((a, b) => {
    if (a.priority === 'High Priority' && b.priority !== 'High Priority') return -1;
    if (b.priority === 'High Priority' && a.priority !== 'High Priority') return 1;
    return a.accuracy - b.accuracy;
  });

  // Generate Recommended Next Actions (Adaptive Learning sequence)
  const recommendedNextActions: RecommendedNextAction[] = [];
  let stepIndex = 1;

  if (identifiedGaps.length > 0) {
    const primaryGap = identifiedGaps[0];
    if (primaryGap.prerequisite) {
      recommendedNextActions.push({
        step: stepIndex++,
        title: `Build Foundation: ${primaryGap.prerequisite}`,
        description: `Strengthen the prerequisite concepts before returning to ${primaryGap.topic}.`,
        actionType: 'review',
        topic: primaryGap.prerequisite,
        chapter: primaryGap.chapterName,
        subject: primaryGap.subject
      });
    }

    recommendedNextActions.push({
      step: stepIndex++,
      title: `Practice Moderate Problems: ${primaryGap.topic}`,
      description: `Solve step-by-step application questions to address the identified gap in ${primaryGap.chapterName}.`,
      actionType: 'practice',
      topic: primaryGap.topic,
      chapter: primaryGap.chapterName,
      subject: primaryGap.subject
    });

    recommendedNextActions.push({
      step: stepIndex++,
      title: `Targeted Reassessment: ${primaryGap.chapterName}`,
      description: `Take a 3-question adaptive checkpoint to verify mastery and elevate your learning level.`,
      actionType: 'reassess',
      topic: primaryGap.topic,
      chapter: primaryGap.chapterName,
      subject: primaryGap.subject
    });
  } else {
    // If no gaps, recommend advancing to higher conceptual applications
    const firstSubject = questions[0]?.subject || 'Mathematics';
    const firstChapter = questions[0]?.chapterName || 'Advanced Concepts';
    recommendedNextActions.push({
      step: 1,
      title: `Accelerated Learning in ${firstChapter}`,
      description: 'You demonstrated strong baseline mastery! Proceed to advanced problem sets.',
      actionType: 'practice',
      topic: firstChapter,
      chapter: firstChapter,
      subject: firstSubject
    });
  }

  const averageTimeSeconds = totalQuestions > 0
    ? Math.round(totalTestDurationSeconds / totalQuestions)
    : 0;

  return {
    studentId,
    assessmentId,
    overallScore,
    learningLevel,
    knowledgeScore,
    timeEfficiencyScore,
    totalQuestions,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unansweredAnswers: unansweredCount,
    totalTimeSeconds: totalTestDurationSeconds,
    averageTimeSeconds,
    chapterPerformance,
    topicPerformance,
    difficultyPerformance,
    questionPerformance: questionRecords,
    identifiedGaps,
    strengths,
    recommendedNextActions,
    isDemoMode,
    createdAt: new Date().toISOString()
  };
}

/**
 * Calls AI recommendation endpoint or generates structured educational feedback
 */
export async function generateAIRecommendations(
  result: PreAssessmentResult
): Promise<PreAssessmentResult['aiRecommendation']> {
  try {
    const summaryPayload = {
      overallScore: result.overallScore,
      knowledgeScore: result.knowledgeScore,
      timeEfficiencyScore: result.timeEfficiencyScore,
      learningLevel: result.learningLevel,
      weakTopics: result.identifiedGaps.map(g => `${g.topic} (${g.chapterName})`),
      strongTopics: result.strengths,
      difficultyPerformance: {
        easy: result.difficultyPerformance.easy.accuracy,
        moderate: result.difficultyPerformance.moderate.accuracy,
        difficult: result.difficultyPerformance.difficult.accuracy
      }
    };

    const res = await fetch('/api/ai/recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: summaryPayload })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.summary) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('AI recommendation endpoint offline or failed, using local deterministic model:', err);
  }

  // Fallback high-quality educational summary
  const primaryGap = result.identifiedGaps[0]?.topic || 'targeted core topics';
  const primaryStrength = result.strengths[0] || 'fundamental concepts';

  return {
    summary: `You scored ${result.overallScore}% on your diagnostic assessment, placing your current understanding at the "${result.learningLevel}" stage. This provides a clear baseline for personalizing your adaptive learning path.`,
    strengthSummary: `You demonstrated solid command of ${primaryStrength}, answering questions with strong accuracy and good timing.`,
    gapSummary: `Your response patterns highlight an immediate opportunity in ${primaryGap}, where multi-step reasoning needs focused reinforcement.`,
    nextSteps: result.recommendedNextActions.map(a => `${a.title}: ${a.description}`)
  };
}
