import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  BookOpen,
  Loader2,
  UploadCloud,
  Layers,
  Award,
  ShieldCheck,
  RotateCcw,
  Info
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import {
  PreAssessmentQuestion,
  ExtractedChapter,
  SubjectType,
  PreAssessmentResult
} from '../types';
import {
  extractChaptersFromMaterial,
  generateCombinedQuestions,
  ChapterQuestionAllocation,
  TARGET_PRE_ASSESSMENT_QUESTIONS
} from '../services/preAssessmentService';
import {
  evaluateAssessmentSession,
  generateAIRecommendations
} from '../services/assessmentScoringService';
import { PreAssessmentResultView } from './PreAssessmentResultView';

export const PreAssessmentView: React.FC = () => {
  const {
    student,
    syllabusData,
    uploadedMaterial,
    setActiveTab,
    preAssessmentResult,
    recordPreAssessmentResult,
    clearPreAssessment
  } = useStudent();

  // Test state machine: 'intro' | 'loading' | 'active' | 'result'
  const [phase, setPhase] = useState<'intro' | 'loading' | 'active' | 'result'>('intro');
  const [loadingMessage, setLoadingMessage] = useState('Analyzing syllabus materials...');
  const [chapters, setChapters] = useState<Record<SubjectType, ExtractedChapter[]>>({} as any);
  const [allocations, setAllocations] = useState<ChapterQuestionAllocation[]>([]);
  const [questions, setQuestions] = useState<PreAssessmentQuestion[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Active Test State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOption: number | null; timeSpentSeconds: number }>>({});
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-question timer tracking
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // If there's an existing result in context, show it
  useEffect(() => {
    if (preAssessmentResult) {
      setPhase('result');
    }
  }, [preAssessmentResult]);

  // Global test timer
  useEffect(() => {
    if (phase === 'active') {
      timerIntervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [phase]);

  // When changing questions, commit time spent on previous question
  const recordCurrentQuestionTime = (fromQuestionId: string) => {
    const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    setAnswers((prev) => {
      const existing = prev[fromQuestionId] || { selectedOption: null, timeSpentSeconds: 0 };
      return {
        ...prev,
        [fromQuestionId]: {
          ...existing,
          timeSpentSeconds: (existing.timeSpentSeconds || 0) + Math.max(1, elapsed)
        }
      };
    });
    questionStartTimeRef.current = Date.now();
  };

  // Prepare and generate questions from uploaded materials / syllabus
  const handleStartGeneration = async () => {
    setPhase('loading');
    setLoadingMessage('AI is analyzing uploaded materials and extracting chapters...');

    try {
      const extractedBySubject: Record<SubjectType, ExtractedChapter[]> = {} as any;
      let usedDemo = false;

      // Check uploaded material from UploadMaterialView
      if (uploadedMaterial && uploadedMaterial.extractedText) {
        const primarySub = student.preferredSubjects[0] || 'Mathematics';
        const { chapters: chs, isDemoMode: demoFlag } = await extractChaptersFromMaterial(
          uploadedMaterial.extractedText,
          primarySub,
          student.grade
        );
        extractedBySubject[primarySub] = chs;
        if (demoFlag) usedDemo = true;
      }

      // Check multi-subject syllabusData
      const subjectsWithSyllabus = Object.keys(syllabusData) as SubjectType[];
      for (const sub of subjectsWithSyllabus) {
        const item = syllabusData[sub];
        if (item?.extractedText && !extractedBySubject[sub]) {
          const { chapters: chs, isDemoMode: demoFlag } = await extractChaptersFromMaterial(
            item.extractedText,
            sub,
            student.grade
          );
          extractedBySubject[sub] = chs;
          if (demoFlag) usedDemo = true;
        }
      }

      // Fallback: If no materials uploaded yet, generate baseline diagnostic for student's preferred subjects
      if (Object.keys(extractedBySubject).length === 0) {
        const fallbackSubs = (student.preferredSubjects && student.preferredSubjects.length > 0)
          ? student.preferredSubjects.slice(0, 2)
          : (['Mathematics', 'Science'] as SubjectType[]);

        for (const sub of fallbackSubs) {
          const { chapters: chs } = await extractChaptersFromMaterial('', sub, student.grade);
          extractedBySubject[sub] = chs;
        }
        usedDemo = true;
      }

      setChapters(extractedBySubject);
      setLoadingMessage('Generating balanced diagnostic assessment (30 questions across verified chapters)...');

      // Generate questions (balanced 30 questions across verified chapters)
      const { questions: genQuestions, isDemoMode: qDemoFlag, allocations: allocs } = await generateCombinedQuestions(
        extractedBySubject,
        student.grade,
        TARGET_PRE_ASSESSMENT_QUESTIONS
      );

      setAllocations(allocs || []);
      setQuestions(genQuestions);
      setIsDemoMode(usedDemo || qDemoFlag);

      // Initialize answers dictionary
      const initialAnswers: Record<string, { selectedOption: number | null; timeSpentSeconds: number }> = {};
      genQuestions.forEach((q) => {
        initialAnswers[q.questionId] = { selectedOption: null, timeSpentSeconds: 0 };
      });
      setAnswers(initialAnswers);

      // Transition to active test
      setCurrentIdx(0);
      setTotalSeconds(0);
      questionStartTimeRef.current = Date.now();
      setPhase('active');
    } catch (err) {
      console.error('Failed to generate pre-assessment:', err);
      // Fallback to active with clean default curriculum questions
      setPhase('intro');
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.questionId]: {
        ...prev[currentQ.questionId],
        selectedOption: optionIndex
      }
    }));
  };

  const handleNavigateQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length || targetIdx === currentIdx) return;
    const currentQ = questions[currentIdx];
    if (currentQ) {
      recordCurrentQuestionTime(currentQ.questionId);
    }
    setCurrentIdx(targetIdx);
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const currentQ = questions[currentIdx];
    if (currentQ) {
      recordCurrentQuestionTime(currentQ.questionId);
    }

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    // Deterministic evaluation
    const result = evaluateAssessmentSession(
      student.id,
      questions,
      answers,
      totalSeconds,
      isDemoMode
    );

    // Call AI recommendation in background
    generateAIRecommendations(result)
      .then((aiRec) => {
        if (aiRec) {
          result.aiRecommendation = aiRec;
          recordPreAssessmentResult(result);
        }
      })
      .catch((err) => console.warn('AI recommendation generation error:', err));

    recordPreAssessmentResult(result);
    setShowSubmitModal(false);
    setIsSubmitting(false);
    setPhase('result');
  };

  const handleRetake = () => {
    clearPreAssessment();
    setPhase('intro');
    setCurrentIdx(0);
    setAnswers({});
    setTotalSeconds(0);
  };

  // Format MM:SS
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Counts for answered questions
  const answeredCount = Object.values(answers).filter(a => a.selectedOption !== null).length;
  const totalCount = questions.length;

  // ==========================================================================
  // VIEW: RESULT
  // ==========================================================================
  if (phase === 'result' && preAssessmentResult) {
    return <PreAssessmentResultView result={preAssessmentResult} onRetake={handleRetake} />;
  }

  // ==========================================================================
  // VIEW: LOADING SPINNER
  // ==========================================================================
  if (phase === 'loading') {
    return (
      <div style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        gap: '20px'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.35)',
          animation: 'pulse-soft 2s infinite ease-in-out'
        }}>
          <BrainCircuit size={36} />
        </div>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
            Preparing Your Diagnostic Assessment
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.5' }}>
            {loadingMessage}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4F46E5', fontSize: '0.85rem', fontWeight: 600 }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Configuring balanced 30 questions (~10 Easy, ~14 Moderate, ~6 Difficult)...</span>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW: INTRO SCREEN
  // ==========================================================================
  if (phase === 'intro') {
    const estQuestions = TARGET_PRE_ASSESSMENT_QUESTIONS;
    const estMinutes = 35;

    return (
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px'
      }}>
        {/* Intro Hero Header */}
        <div className="card" style={{
          padding: '36px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
          border: '1.5px solid #C7D2FE',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#4F46E5',
              backgroundColor: '#EEF2FF',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid #C7D2FE'
            }}>
              GuruMitra Diagnostic Engine
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E293B', margin: 0, letterSpacing: '-0.02em' }}>
            Your Combined Learning Diagnostic
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            This short diagnostic assessment is designed to establish an authentic baseline of what you already know.
            By analyzing your response accuracy and conceptual efficiency, GuruMitra pinpoints your topic-level strengths,
            uncovers hidden knowledge gaps, and tailors your personalized adaptive learning path.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '8px'
          }}>
            <button
              onClick={handleStartGeneration}
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '14px',
                boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.4)'
              }}
            >
              <Sparkles size={18} />
              <span>Start Diagnostic Assessment</span>
              <ArrowRight size={18} />
            </button>

            {uploadedMaterial ? (
              <span style={{ fontSize: '0.82rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                Using uploaded file: "{uploadedMaterial.fileName}"
              </span>
            ) : Object.keys(syllabusData).length > 0 ? (
              <span style={{ fontSize: '0.82rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                Using uploaded syllabus files across {Object.keys(syllabusData).length} subjects
              </span>
            ) : (
              <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={16} />
                Using authentic standard curriculum chapters for {student.grade}
              </span>
            )}
          </div>
        </div>

        {/* Diagnostic Blueprint Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Layers size={20} color="#4F46E5" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                One Combined Test
              </h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
              Questions from all your learning materials are interleaved so you don't take separate exams for each subject.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Award size={20} color="#059669" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Balanced 30 Questions
              </h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
              Proportionally distributed across extracted chapters (~10 Easy, ~14 Moderate, ~6 Difficult).
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Clock size={20} color="#D97706" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Fair Efficiency Tracking
              </h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
              Scored 80% on accuracy and 20% on normalized response timing without harsh penalties for careful solving.
            </p>
          </div>
        </div>

        {/* Upload More Materials Banner */}
        <div style={{
          padding: '18px 24px',
          borderRadius: '14px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
              Want your assessment grounded in a specific PDF textbook or class notes?
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Upload any PDF chapter in the Upload Material tab, and GuruMitra will extract its specific concepts.
            </div>
          </div>
          <button
            onClick={() => setActiveTab('upload')}
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            <UploadCloud size={15} />
            <span>Upload Custom PDF</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW: ACTIVE TEST SESSION
  // ==========================================================================
  const currentQ = questions[currentIdx];
  if (!currentQ) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p>No questions loaded.</p>
        <button onClick={() => setPhase('intro')} className="btn btn-primary">Back to Intro</button>
      </div>
    );
  }

  const currentAnswer = answers[currentQ.questionId]?.selectedOption ?? null;
  const isLastQuestion = currentIdx === questions.length - 1;

  const difficultyColors = {
    easy: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    moderate: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    difficult: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' }
  };
  const diffStyle = difficultyColors[currentQ.difficulty];

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '24px 20px 80px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Top Bar: Progress, Timer, and Submit button */}
      <div className="card" style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <BrainCircuit size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Adaptive Pre-Assessment
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
              Question {currentIdx + 1} <span style={{ color: '#94A3B8', fontWeight: 500 }}>of {totalCount}</span>
            </div>
          </div>
        </div>

        {/* Live Elapsed Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '999px',
          backgroundColor: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          color: '#1E293B',
          fontSize: '0.92rem',
          fontWeight: 700
        }}>
          <Clock size={16} color="#4F46E5" />
          <span>{formatTimer(totalSeconds)}</span>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="btn btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.84rem' }}
        >
          <span>Submit Test</span>
        </button>
      </div>

      {/* Question Palette / Navigator */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Question Palette ({answeredCount} answered)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: '#64748B' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4F46E5' }} /> Answered
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CBD5E1' }} /> Unanswered
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          maxHeight: '140px',
          overflowY: 'auto',
          padding: '4px 2px'
        }}>
          {questions.map((q, idx) => {
            const isAnswered = answers[q.questionId]?.selectedOption !== null && answers[q.questionId]?.selectedOption !== undefined;
            const isCurrent = idx === currentIdx;

            return (
              <button
                key={q.questionId}
                onClick={() => handleNavigateQuestion(idx)}
                style={{
                  minWidth: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: isCurrent
                    ? '2px solid #4F46E5'
                    : isAnswered
                    ? '1px solid #C7D2FE'
                    : '1px solid #E2E8F0',
                  backgroundColor: isCurrent
                    ? '#EEF2FF'
                    : isAnswered
                    ? '#4F46E5'
                    : '#FFFFFF',
                  color: isCurrent
                    ? '#4F46E5'
                    : isAnswered
                    ? '#FFFFFF'
                    : '#64748B',
                  fontWeight: isCurrent || isAnswered ? 800 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{ padding: '32px 32px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Question Metadata Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '6px',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5'
            }}>
              {currentQ.subject}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
              Chapter: {currentQ.chapterName}
            </span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              {currentQ.topic}
            </span>
          </div>

          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '999px',
            backgroundColor: diffStyle.bg,
            color: diffStyle.text,
            border: `1px solid ${diffStyle.border}`
          }}>
            {currentQ.difficulty.toUpperCase()}
          </div>
        </div>

        {/* Question Text */}
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#1E293B',
          lineHeight: '1.6',
          margin: 0
        }}>
          {currentQ.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = currentAnswer === optIdx;
            const letter = String.fromCharCode(65 + optIdx);

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: isSelected
                    ? '2px solid #4F46E5'
                    : '1.5px solid #E2E8F0',
                  backgroundColor: isSelected
                    ? '#EEF2FF'
                    : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: isSelected
                    ? '2px solid #4F46E5'
                    : '1.5px solid #CBD5E1',
                  backgroundColor: isSelected
                    ? '#4F46E5'
                    : '#FFFFFF',
                  color: isSelected
                    ? '#FFFFFF'
                    : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {letter}
                </div>

                <span style={{
                  fontSize: '0.95rem',
                  color: isSelected ? '#1E293B' : '#334155',
                  fontWeight: isSelected ? 700 : 500,
                  lineHeight: '1.4'
                }}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          paddingTop: '20px',
          borderTop: '1px solid #F1F5F9'
        }}>
          <button
            onClick={() => handleNavigateQuestion(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="btn btn-outline"
            style={{
              padding: '10px 20px',
              fontSize: '0.85rem',
              opacity: currentIdx === 0 ? 0.4 : 1,
              cursor: currentIdx === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
            Question {currentIdx + 1} of {totalCount}
          </span>

          {isLastQuestion ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.88rem' }}
            >
              <span>Review & Submit</span>
              <CheckCircle2 size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleNavigateQuestion(currentIdx + 1)}
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.85rem' }}
            >
              <span>Next Question</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '460px',
            width: '100%',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: '0 0 8px' }}>
                Submit Diagnostic Assessment?
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                You have answered <strong>{answeredCount}</strong> of <strong>{totalCount}</strong> questions.
                {answeredCount < totalCount && (
                  <span style={{ display: 'block', color: '#DC2626', marginTop: '6px', fontWeight: 600 }}>
                    Notice: {totalCount - answeredCount} question(s) remain unanswered.
                  </span>
                )}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-outline"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTest}
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontSize: '0.85rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <span>Confirm & Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
