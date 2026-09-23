import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Award,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Clock,
  Timer,
  Zap,
  Check,
  TrendingUp,
  BarChart2,
  FileQuestion,
  FastForward
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import {
  SubjectType,
  QuizQuestion,
  QuizResult,
  DifficultyLevel,
  QuizMode,
  QuestionResponseLog,
  TimedQuizAnalytics
} from '../types';
import { getQuizQuestions, getChapters } from '../services/curriculumService';
import { calculateAdaptiveQuizTimer, determineStudentPace } from '../services/quizEngine';

export const QuizView: React.FC = () => {
  const {
    student,
    activeSubject,
    recordQuizResult,
    lastQuizResult,
    setActiveTab,
    currentLearningContext
  } = useStudent();

  const questionsToUse = getQuizQuestions(
    student.grade,
    student.board,
    student.stream,
    activeSubject,
    currentLearningContext.chapter,
    currentLearningContext.topic,
    student.level
  );

  const studentPace = determineStudentPace(student, lastQuizResult);
  const adaptiveTimerConfig = calculateAdaptiveQuizTimer(
    currentLearningContext,
    questionsToUse.length,
    student,
    lastQuizResult
  );

  // Mode and Timer configuration
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');
  const [isTimerEnabled, setIsTimerEnabled] = useState<boolean>(true);
  
  // Adaptive timer durations dynamically derived from grade, subject, difficulty, and student pace
  const [totalTimeLimit, setTotalTimeLimit] = useState<number>(adaptiveTimerConfig.totalSeconds);
  const [timeRemaining, setTimeRemaining] = useState<number>(adaptiveTimerConfig.totalSeconds);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState<boolean>(false);

  // Question navigation and response tracking
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Per-question response log tracking
  const [questionLogs, setQuestionLogs] = useState<QuestionResponseLog[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<number, { selectedIndex: number | null; isCorrect: boolean; timeSpent: number; skipped: boolean }>
  >({});
  
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset quiz states whenever topic, subject, or questions change
  useEffect(() => {
    const config = calculateAdaptiveQuizTimer(
      currentLearningContext,
      questionsToUse.length,
      student,
      lastQuizResult
    );
    setTotalTimeLimit(config.totalSeconds);
    setTimeRemaining(config.totalSeconds);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setQuestionLogs([]);
    setQuestionAnswers({});
    setIsCompleted(false);
    setIsAutoSubmitted(false);
    questionStartTimeRef.current = Date.now();
  }, [
    activeSubject,
    currentLearningContext.chapter,
    currentLearningContext.topic,
    currentLearningContext.difficulty,
    student.grade,
    student.board,
    student.stream,
    questionsToUse.length
  ]);

  // Update selectedOption when navigating between questions
  useEffect(() => {
    const existing = questionAnswers[currentQIndex];
    if (existing && existing.selectedIndex !== null && !existing.skipped) {
      setSelectedOption(existing.selectedIndex);
    } else {
      setSelectedOption(null);
    }
    questionStartTimeRef.current = Date.now();
  }, [currentQIndex]);

  // Active Countdown Timer Engine
  useEffect(() => {
    const timerActive = !isCompleted && (quizMode === 'exam' || isTimerEnabled);

    if (!timerActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCompleted, quizMode, isTimerEnabled, questionsToUse]);

  const currentQ = questionsToUse[currentQIndex] || questionsToUse[0];

  // Calculate answered vs remaining questions
  const answeredCount = Object.values(questionAnswers).filter(
    (a) => a.selectedIndex !== null && !a.skipped
  ).length;
  const skippedCount = Object.values(questionAnswers).filter((a) => a.skipped).length;
  const remainingCount = Math.max(0, questionsToUse.length - answeredCount - skippedCount);

  // Time formatting helper
  const formatTime = (seconds: number) => {
    const safeSec = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safeSec / 60);
    const secs = safeSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer visual urgency state
  const timePercent = totalTimeLimit > 0 ? (timeRemaining / totalTimeLimit) * 100 : 100;
  const isUrgent = timePercent < 25;
  const isWarning = timePercent >= 25 && timePercent <= 50;

  const handleSelectOption = (index: number) => {
    if (isCompleted || isAutoSubmitted) return;
    setSelectedOption(index);
  };

  // Move to next question or submit
  const handleNextQuestion = () => {
    if (selectedOption === null || isAutoSubmitted) return;

    const elapsed = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    const isCorrect = selectedOption === currentQ.correctIndex;

    const updatedAnswers = {
      ...questionAnswers,
      [currentQIndex]: {
        selectedIndex: selectedOption,
        isCorrect,
        timeSpent: (questionAnswers[currentQIndex]?.timeSpent || 0) + elapsed,
        skipped: false
      }
    };
    setQuestionAnswers(updatedAnswers);

    // Update log
    const updatedLog: QuestionResponseLog = {
      questionId: currentQ.id || `q-${currentQIndex}`,
      questionIndex: currentQIndex,
      timeSpent: elapsed,
      correct: isCorrect,
      skipped: false,
      selectedIndex: selectedOption
    };
    const newLogs = [...questionLogs.filter((l) => l.questionIndex !== currentQIndex), updatedLog];
    setQuestionLogs(newLogs);

    if (currentQIndex + 1 < questionsToUse.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishQuiz(updatedAnswers, newLogs, false);
    }
  };

  // Skip question
  const handleSkipQuestion = () => {
    if (isCompleted || isAutoSubmitted) return;

    const elapsed = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    const updatedAnswers = {
      ...questionAnswers,
      [currentQIndex]: {
        selectedIndex: null,
        isCorrect: false,
        timeSpent: (questionAnswers[currentQIndex]?.timeSpent || 0) + elapsed,
        skipped: true
      }
    };
    setQuestionAnswers(updatedAnswers);

    const updatedLog: QuestionResponseLog = {
      questionId: currentQ.id || `q-${currentQIndex}`,
      questionIndex: currentQIndex,
      timeSpent: elapsed,
      correct: false,
      skipped: true,
      selectedIndex: null
    };
    const newLogs = [...questionLogs.filter((l) => l.questionIndex !== currentQIndex), updatedLog];
    setQuestionLogs(newLogs);

    if (currentQIndex + 1 < questionsToUse.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishQuiz(updatedAnswers, newLogs, false);
    }
  };

  // Previous question navigation
  const handlePreviousQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  // Auto-submit trigger when countdown hits 00:00
  const handleAutoSubmit = () => {
    setIsAutoSubmitted(true);

    // Save current selection if one was picked
    const elapsed = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    const answersCopy = { ...questionAnswers };
    const logsCopy = [...questionLogs];

    if (selectedOption !== null && !answersCopy[currentQIndex]) {
      const isCorrect = selectedOption === currentQ.correctIndex;
      answersCopy[currentQIndex] = {
        selectedIndex: selectedOption,
        isCorrect,
        timeSpent: elapsed,
        skipped: false
      };
      logsCopy.push({
        questionId: currentQ.id || `q-${currentQIndex}`,
        questionIndex: currentQIndex,
        timeSpent: elapsed,
        correct: isCorrect,
        skipped: false,
        selectedIndex: selectedOption
      });
    }

    // Fill in any remaining unvisited questions as skipped
    for (let i = 0; i < questionsToUse.length; i++) {
      if (!answersCopy[i]) {
        answersCopy[i] = {
          selectedIndex: null,
          isCorrect: false,
          timeSpent: 0,
          skipped: true
        };
        logsCopy.push({
          questionId: questionsToUse[i].id || `q-${i}`,
          questionIndex: i,
          timeSpent: 0,
          correct: false,
          skipped: true,
          selectedIndex: null
        });
      }
    }

    setQuestionAnswers(answersCopy);
    setQuestionLogs(logsCopy);
    finishQuiz(answersCopy, logsCopy, true);
  };

  // Complete Quiz and Compute Analytics Matrix
  const finishQuiz = (
    answersMap: Record<number, { selectedIndex: number | null; isCorrect: boolean; timeSpent: number; skipped: boolean }>,
    logs: QuestionResponseLog[],
    autoSubmitted = false
  ) => {
    const total = questionsToUse.length;
    const answeredEntries = Object.entries(answersMap).filter(
      ([_, a]) => a.selectedIndex !== null && !a.skipped
    );
    const correctCount = answeredEntries.filter(([_, a]) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Time calculations
    const totalTimeUsed = Math.max(1, totalTimeLimit - Math.max(0, timeRemaining));
    const times = logs.filter((l) => !l.skipped && l.timeSpent > 0).map((l) => l.timeSpent);
    const avgResponseTime = times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : Math.round(totalTimeUsed / Math.max(1, answeredEntries.length));
    
    const fastestResponse = times.length > 0 ? Math.min(...times) : avgResponseTime;
    const slowestResponse = times.length > 0 ? Math.max(...times) : avgResponseTime;

    // Speed classification
    let speedCategory: 'fast' | 'moderate' | 'slow' = 'moderate';
    if (avgResponseTime <= 30) {
      speedCategory = 'fast';
    } else if (avgResponseTime > 50) {
      speedCategory = 'slow';
    }

    // Adaptive Performance Insight & Recommended Next Step
    let performanceInsight = '';
    let recommendedNextStep = '';

    if (accuracy >= 80 && speedCategory === 'fast') {
      performanceInsight =
        "Great accuracy and strong response speed! You demonstrate fluent conceptual recall under time pressure.";
      recommendedNextStep = 'You are ready for advanced multi-step challenge problems.';
    } else if (accuracy >= 80 && speedCategory === 'slow') {
      performanceInsight =
        "Your concepts are strong, but your average response time suggests practicing faster recall for exam situations.";
      recommendedNextStep = `Practice 5 rapid-response questions on ${currentLearningContext.topic || activeSubject}.`;
    } else if (accuracy < 60 && speedCategory === 'fast') {
      performanceInsight =
        "You responded quickly, but some concepts need reinforcement. Deliberate reasoning will prevent careless mistakes.";
      recommendedNextStep = `Review core rules and formulas before attempting another timed set.`;
    } else if (accuracy < 60 && speedCategory === 'slow') {
      performanceInsight =
        "Let's strengthen the core concepts before increasing difficulty or time pressure.";
      recommendedNextStep = `Step through the foundational lesson with diagrams and real-world analogies.`;
    } else {
      performanceInsight =
        "You have a solid foundation with steady response pacing. Continued practice will build exam confidence.";
      recommendedNextStep = `Complete a short review of missed questions to solidify mastery.`;
    }

    // Difficulty adaptation
    let newDiff: DifficultyLevel = 'Intermediate';
    let adaptMsg = '';
    if (accuracy >= 80) {
      newDiff = 'Advanced';
      adaptMsg = 'Great performance! Difficulty increased to Advanced.';
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else if (accuracy >= 60) {
      newDiff = 'Intermediate';
      adaptMsg = "You're progressing steadily. Continue at Intermediate level.";
    } else {
      newDiff = 'Beginner';
      adaptMsg = "Let's strengthen the basics before moving ahead.";
    }

    const activeTopicTitle = currentLearningContext.topic || currentQ?.topic || activeSubject;

    const userAnswersList = Object.entries(answersMap).map(([idx, val]) => ({
      questionIndex: parseInt(idx, 10),
      selectedIndex: val.selectedIndex ?? -1,
      isCorrect: val.isCorrect
    }));

    const timedAnalytics: TimedQuizAnalytics = {
      totalTimeUsed,
      totalTimeLimit,
      averageResponseTime: avgResponseTime,
      fastestResponseTime: fastestResponse,
      slowestResponseTime: slowestResponse,
      questionsAnswered: answeredEntries.length,
      questionsSkipped: total - answeredEntries.length,
      speedCategory,
      performanceInsight,
      recommendedNextStep,
      isExamMode: quizMode === 'exam',
      autoSubmitted,
      questionLogs: logs
    };

    const result: QuizResult = {
      score: correctCount,
      totalQuestions: total,
      accuracy,
      subject: activeSubject,
      topic: activeTopicTitle,
      difficulty: currentQ?.difficulty || 'Intermediate',
      strongTopics: accuracy >= 60 ? [activeTopicTitle] : [],
      weakTopics: accuracy < 60 ? [activeTopicTitle] : [],
      adaptationMessage: adaptMsg,
      newDifficulty: newDiff,
      recommendedTopic: accuracy < 60 ? `${activeTopicTitle} Basics` : `Advanced ${activeTopicTitle}`,
      userAnswers: userAnswersList,
      timedQuizAnalytics: timedAnalytics,
      isExamMode: quizMode === 'exam'
    };

    recordQuizResult(result);
    setIsCompleted(true);
  };

  // Hackathon demo fast-forward simulation (matching Step 5 of Judge Tour)
  const handleSimulateDemo58 = () => {
    const simulatedAnswers = [
      { questionIndex: 0, selectedIndex: 0, isCorrect: true, timeSpent: 22, skipped: false },
      { questionIndex: 1, selectedIndex: 1, isCorrect: true, timeSpent: 25, skipped: false },
      { questionIndex: 2, selectedIndex: 2, isCorrect: false, timeSpent: 38, skipped: false },
      { questionIndex: 3, selectedIndex: 3, isCorrect: true, timeSpent: 18, skipped: false },
      { questionIndex: 4, selectedIndex: 0, isCorrect: false, timeSpent: 42, skipped: false },
      { questionIndex: 5, selectedIndex: 1, isCorrect: true, timeSpent: 26, skipped: false },
      { questionIndex: 6, selectedIndex: 2, isCorrect: false, timeSpent: 30, skipped: false },
      { questionIndex: 7, selectedIndex: 3, isCorrect: true, timeSpent: 19, skipped: false },
      { questionIndex: 8, selectedIndex: 0, isCorrect: false, timeSpent: 28, skipped: false },
      { questionIndex: 9, selectedIndex: 1, isCorrect: false, timeSpent: 32, skipped: false },
    ];

    const answersMap: Record<number, any> = {};
    const logs: QuestionResponseLog[] = [];

    simulatedAnswers.forEach((a) => {
      answersMap[a.questionIndex] = a;
      logs.push({
        questionId: `q-demo-${a.questionIndex}`,
        questionIndex: a.questionIndex,
        timeSpent: a.timeSpent,
        correct: a.isCorrect,
        skipped: false,
        selectedIndex: a.selectedIndex
      });
    });

    const activeTopicTitle = currentLearningContext.topic || `${activeSubject} Diagnostic`;

    const timedAnalytics: TimedQuizAnalytics = {
      totalTimeUsed: 280,
      totalTimeLimit: 600,
      averageResponseTime: 28,
      fastestResponseTime: 18,
      slowestResponseTime: 42,
      questionsAnswered: 10,
      questionsSkipped: 0,
      speedCategory: 'fast',
      performanceInsight:
        'You responded quickly, but some concepts need reinforcement. Deliberate reasoning will prevent mistakes.',
      recommendedNextStep: `Review core concept reasoning before attempting another timed quiz.`,
      isExamMode: true,
      autoSubmitted: false,
      questionLogs: logs
    };

    const result: QuizResult = {
      score: 6,
      totalQuestions: 10,
      accuracy: 58,
      subject: activeSubject,
      topic: activeTopicTitle,
      difficulty: 'Intermediate',
      strongTopics: [`${activeTopicTitle} Foundations`],
      weakTopics: [`${activeTopicTitle} Geometry Basics`],
      adaptationMessage: 'Accuracy is 58%. System adjusted difficulty to Beginner and recommended revision.',
      newDifficulty: 'Beginner',
      recommendedTopic: `${activeTopicTitle} Fundamentals`,
      userAnswers: simulatedAnswers.map((s) => ({
        questionIndex: s.questionIndex,
        selectedIndex: s.selectedIndex,
        isCorrect: s.isCorrect
      })),
      timedQuizAnalytics: timedAnalytics,
      isExamMode: true
    };

    recordQuizResult(result);
    setIsCompleted(true);
  };

  const handleRestart = () => {
    const config = calculateAdaptiveQuizTimer(
      currentLearningContext,
      questionsToUse.length,
      student,
      lastQuizResult
    );
    setTotalTimeLimit(config.totalSeconds);
    setTimeRemaining(config.totalSeconds);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setQuestionLogs([]);
    setQuestionAnswers({});
    setIsCompleted(false);
    setIsAutoSubmitted(false);
    questionStartTimeRef.current = Date.now();
  };

  // STRICT NO FALLBACK RULE: If no questions match this specific topic, render clear notification
  if (questionsToUse.length === 0) {
    return (
      <div style={{
        maxWidth: '780px',
        margin: '40px auto',
        padding: '48px 32px',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#EEF2FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4F46E5'
        }}>
          <HelpCircle size={32} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#6366F1',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {activeSubject} • {currentLearningContext.chapter || 'Curriculum'}
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            {currentLearningContext.topic || activeSubject}
          </h2>
        </div>

        <div style={{
          padding: '16px 24px',
          borderRadius: '12px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          color: '#475569',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          maxWidth: '520px'
        }}>
          No quiz is currently available for this topic. Please try another topic.
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('adaptive')}
            className="btn btn-primary"
            style={{ padding: '10px 22px' }}
          >
            <BookOpen size={16} />
            <span>Return to Lesson</span>
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className="btn btn-secondary"
            style={{ padding: '10px 22px' }}
          >
            <span>Explore Subjects</span>
          </button>
        </div>
      </div>
    );
  }

  // RENDER POST-QUIZ RESULTS SCREEN
  if (isCompleted && lastQuizResult) {
    const { score, totalQuestions, accuracy, subject, topic, adaptationMessage, newDifficulty, recommendedTopic, timedQuizAnalytics } = lastQuizResult;
    const isSuccess = accuracy >= 80;
    const isWarning = accuracy < 60;

    return (
      <div style={{
        maxWidth: '920px',
        margin: '0 auto',
        padding: '32px 24px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Auto-Submit Notice Banner (if triggered by timeout) */}
        {timedQuizAnalytics?.autoSubmitted && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: '14px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991B1B'
          }}>
            <AlertTriangle size={20} color="#DC2626" />
            <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>
              Time's up! Your quiz has been submitted automatically.
            </span>
          </div>
        )}

        {/* Top Result Banner */}
        <div className="card" style={{
          padding: '28px 32px',
          textAlign: 'center',
          background: isSuccess
            ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
            : isWarning
            ? 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)'
            : 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
          border: isSuccess ? '1.5px solid #A7F3D0' : isWarning ? '1.5px solid #FED7AA' : '1.5px solid #C7D2FE'
        }}>
          <span style={{ fontSize: '2.4rem', marginBottom: '6px', display: 'block' }}>
            {isSuccess ? '🏆' : isWarning ? '💡' : '📈'}
          </span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
            {lastQuizResult.isExamMode ? 'Exam Challenge Completed' : 'Quiz Completed'}
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#475569', margin: 0 }}>
            Subject: <strong>{subject}</strong> • Topic: <strong>{topic}</strong>
          </p>
        </div>

        {/* Enhanced 5-Metric Performance Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px'
        }}>
          {/* 1. Score */}
          <div className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Score
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E293B', margin: '4px 0' }}>
              {score} / {totalQuestions}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
              {Math.round((score / totalQuestions) * 100)}% Marks
            </span>
          </div>

          {/* 2. Accuracy */}
          <div className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Accuracy
            </span>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: isSuccess ? '#10B981' : isWarning ? '#EF4444' : '#4F46E5',
              margin: '4px 0'
            }}>
              {accuracy}%
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              {accuracy >= 80 ? 'Mastery' : accuracy >= 60 ? 'Developing' : 'Reinforce'}
            </span>
          </div>

          {/* 3. Time Used */}
          <div className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Time Used
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4F46E5', margin: '4px 0' }}>
              {timedQuizAnalytics ? formatTime(timedQuizAnalytics.totalTimeUsed) : 'Relaxed'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              {timedQuizAnalytics ? `of ${formatTime(timedQuizAnalytics.totalTimeLimit)}` : 'No limit'}
            </span>
          </div>

          {/* 4. Average Response */}
          <div className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Avg Response
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
              {timedQuizAnalytics?.averageResponseTime || 30}s
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: timedQuizAnalytics?.speedCategory === 'fast' ? '#10B981' : timedQuizAnalytics?.speedCategory === 'slow' ? '#D97706' : '#4F46E5'
            }}>
              {timedQuizAnalytics?.speedCategory === 'fast' ? '⚡ Fluent' : timedQuizAnalytics?.speedCategory === 'slow' ? '⏳ Deliberate' : '⏱️ Steady'}
            </span>
          </div>

          {/* 5. Questions Attempted */}
          <div className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Attempted
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E293B', margin: '4px 0' }}>
              {timedQuizAnalytics?.questionsAnswered ?? totalQuestions} / {totalQuestions}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              {timedQuizAnalytics?.questionsSkipped ? `${timedQuizAnalytics.questionsSkipped} skipped` : '100% finished'}
            </span>
          </div>
        </div>

        {/* Adaptive Response Speed & Performance Insight Box */}
        {timedQuizAnalytics?.performanceInsight && (
          <div className="card" style={{
            padding: '24px 28px',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#4F46E5" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Performance Insight (Accuracy + Speed Analysis)
              </h4>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#334155', margin: 0, lineHeight: '1.6' }}>
              {timedQuizAnalytics.performanceInsight}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #E2E8F0',
              marginTop: '4px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Recommended Next Step:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4F46E5', marginTop: '2px' }}>
                  {timedQuizAnalytics.recommendedNextStep}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('adaptive')}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <span>Continue Lesson</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Adaptive Recalibration Card */}
        <div className="card" style={{
          padding: '24px 28px',
          backgroundColor: isWarning ? '#FEF2F2' : isSuccess ? '#F0FDF4' : '#EEF2FF',
          border: isWarning ? '1.5px solid #FECACA' : isSuccess ? '1.5px solid #BBF7D0' : '1.5px solid #C7D2FE',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color={isWarning ? '#DC2626' : isSuccess ? '#15803D' : '#4F46E5'} />
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: isWarning ? '#991B1B' : isSuccess ? '#166534' : '#1E1B4B',
              margin: 0
            }}>
              Adaptive Engine Calibration
            </h4>
          </div>

          <p style={{
            fontSize: '0.92rem',
            color: isWarning ? '#7F1D1D' : isSuccess ? '#14532D' : '#312E81',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {adaptationMessage} Difficulty automatically set to <strong>{newDifficulty}</strong>.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(0,0,0,0.08)'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#334155' }}>
              Targeted Topic: <strong>{recommendedTopic}</strong>
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <span>View Recommendations</span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={handleRestart}
                className="btn btn-outline"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <RotateCcw size={14} />
                <span>Retake Quiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Question Review List with Response Times */}
        {timedQuizAnalytics?.questionLogs && timedQuizAnalytics.questionLogs.length > 0 && (
          <div className="card" style={{ padding: '24px 28px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>
              Response Speed & Accuracy Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {timedQuizAnalytics.questionLogs.map((log, idx) => {
                const q = questionsToUse[log.questionIndex] || questionsToUse[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: log.correct ? '#F0FDF4' : log.skipped ? '#F8FAFC' : '#FEF2F2',
                      border: log.correct ? '1px solid #DCFCE7' : log.skipped ? '1px solid #E2E8F0' : '1px solid #FEE2E2'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <span style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: log.correct ? '#22C55E' : log.skipped ? '#94A3B8' : '#EF4444',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{
                        fontSize: '0.88rem',
                        color: '#1E293B',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {q?.question || `Question ${idx + 1}`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                        ⏱ {log.timeSpent}s
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: log.correct ? '#166534' : log.skipped ? '#64748B' : '#991B1B'
                      }}>
                        {log.correct ? 'Correct' : log.skipped ? 'Skipped' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // RENDER ACTIVE QUESTION FLOW
  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '32px 24px 64px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Top Header & Mode Toggle Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {quizMode === 'exam' ? '⏱️ Exam Challenge' : 'Practice Quiz'} • {currentLearningContext.classLevel || student.grade} • {currentLearningContext.board || student.board}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
              {activeSubject}
            </span>
            {currentLearningContext.chapter && (
              <>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>•</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                  {currentLearningContext.chapter}
                </span>
              </>
            )}
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#1E293B', margin: '2px 0 0' }}>
            Quiz: {currentLearningContext.topic || currentQ?.topic || activeSubject}
          </h1>
        </div>

        {/* Quiz Mode Selector Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFFFFF',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <button
            onClick={() => setQuizMode('practice')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: quizMode === 'practice' ? '#4F46E5' : 'transparent',
              color: quizMode === 'practice' ? '#FFFFFF' : '#64748B',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Practice Mode
          </button>
          <button
            onClick={() => {
              setQuizMode('exam');
              setIsTimerEnabled(true);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: quizMode === 'exam' ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' : 'transparent',
              color: quizMode === 'exam' ? '#FFFFFF' : '#64748B',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Exam Challenge
          </button>
        </div>
      </div>

      {/* Timer Bar + Question Progress Bar */}
      <div className="card" style={{ padding: '16px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '10px'
        }}>
          {/* Question Index & Status Counters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>
              Question {currentQIndex + 1} of {questionsToUse.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748B' }}>
              <span style={{ color: '#10B981', fontWeight: 700 }}>
                Answered: {answeredCount}
              </span>
              <span>•</span>
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                Remaining: {remainingCount}
              </span>
            </div>
          </div>

          {/* Countdown Timer Badge */}
          {(quizMode === 'exam' || isTimerEnabled) && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '4px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '999px',
                backgroundColor: isUrgent ? '#FEE2E2' : isWarning ? '#FEF3C7' : '#EEF2FF',
                border: isUrgent ? '1.5px solid #FCA5A5' : isWarning ? '1.5px solid #FCD34D' : '1.5px solid #C7D2FE',
                color: isUrgent ? '#DC2626' : isWarning ? '#D97706' : '#4F46E5',
                fontWeight: 800,
                fontSize: '0.92rem',
                boxShadow: isUrgent ? '0 0 12px rgba(220, 38, 38, 0.25)' : 'none',
                animation: isUrgent ? 'pulse 1s infinite' : 'none'
              }}>
                <Timer size={16} />
                <span>TIME LEFT: {formatTime(timeRemaining)}</span>
                {isUrgent && <span style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>(Hurry!)</span>}
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>
                Adaptive: {adaptiveTimerConfig.secondsPerQuestion}s/q • Pace: {studentPace}
              </span>
            </div>
          )}

          {/* Fast Simulation Button for Step 5 of Judge Tour */}
          <button
            onClick={handleSimulateDemo58}
            className="btn"
            style={{
              backgroundColor: '#FFF7ED',
              color: '#C2410C',
              border: '1px solid #FFEDD5',
              padding: '6px 12px',
              fontSize: '0.74rem',
              borderRadius: '999px',
              fontWeight: 700
            }}
            title="Fast-forward: Simulates 58% score with response speed metrics"
          >
            ⚡ Fast-Forward: 58% Score (Demo Step 5)
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container" style={{ height: '6px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentQIndex + 1) / questionsToUse.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#1E293B',
          lineHeight: '1.5',
          marginBottom: '24px'
        }}>
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          {currentQ.options.map((opt: string, index: number) => {
            const isSelected = selectedOption === index;
            const letter = ['A', 'B', 'C', 'D'][index];

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={isCompleted || isAutoSubmitted}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid #10B981' : '1.5px solid var(--border-subtle)',
                  backgroundColor: isSelected ? '#DCFCE7' : '#FFFFFF',
                  color: isSelected ? '#15803D' : '#1E293B',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#10B981' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {letter}
                  </span>
                  <span>{opt}</span>
                </div>

                {isSelected && (
                  <CheckCircle2 size={20} color="#10B981" />
                )}
              </button>
            );
          })}
        </div>

        {/* Question Navigation Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #F1F5F9',
          paddingTop: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Previous Question Button */}
          <button
            onClick={handlePreviousQuestion}
            className="btn btn-outline"
            style={{ padding: '10px 18px', borderRadius: '12px' }}
            disabled={currentQIndex === 0}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {/* Skip and Next/Submit Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleSkipQuestion}
              className="btn btn-outline"
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                color: '#64748B'
              }}
            >
              <span>Skip Question</span>
            </button>

            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
              style={{ padding: '10px 24px', borderRadius: '12px' }}
              disabled={selectedOption === null}
            >
              <span>{currentQIndex + 1 === questionsToUse.length ? 'Submit Quiz' : 'Next Question'}</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
