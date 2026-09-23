import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  BrainCircuit,
  Info,
  Layers,
  Target
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { PreAssessmentResult, LearningGapItem, RecommendedNextAction } from '../types';

interface PreAssessmentResultViewProps {
  result: PreAssessmentResult;
  onRetake: () => void;
}

export const PreAssessmentResultView: React.FC<PreAssessmentResultViewProps> = ({
  result,
  onRetake
}) => {
  const { setActiveTab, setActiveSubject, setTopicContext } = useStudent();
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [expandedGapId, setExpandedGapId] = useState<string | null>(null);

  // Formatting helpers
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}m ${remainder < 10 ? '0' : ''}${remainder}s`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Strong':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'Proficient':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'Developing':
        return { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };
      case 'Beginner':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      default:
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    }
  };

  const levelColor = getLevelColor(result.learningLevel);

  const handleStartAction = (action: RecommendedNextAction) => {
    if (action.subject) {
      setActiveSubject(action.subject);
    }
    if (action.chapter && action.topic) {
      setTopicContext(action.subject, action.chapter, action.topic);
    }
    if (action.actionType === 'review') {
      setActiveTab('tutor');
    } else {
      setActiveTab('adaptive');
    }
  };

  return (
    <div style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '32px 24px 80px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#4F46E5'
            }}>
              Diagnostic Pre-Assessment
            </span>
            {result.isDemoMode && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                border: '1px solid #E2E8F0'
              }}>
                Demo Mode
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Your Learning Baseline & Diagnostic Report
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '4px' }}>
            Analyzed across {Object.keys(result.chapterPerformance).length} chapters from your uploaded learning materials.
          </p>
        </div>

        <button
          onClick={onRetake}
          className="btn btn-outline"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <RotateCcw size={15} />
          <span>Retake Diagnostic</span>
        </button>
      </div>

      {/* Hero Score Card */}
      <div className="card" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: '1.5px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px',
        alignItems: 'center'
      }}>
        {/* Left: Big Circular Learning Level Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            position: 'relative',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: `conic-gradient(#4F46E5 ${result.overallScore * 3.6}deg, #E2E8F0 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.25)',
            flexShrink: 0
          }}>
            <div style={{
              width: '102px',
              height: '102px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#1E293B', lineHeight: 1 }}>
                {result.overallScore}%
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginTop: '2px' }}>
                Diagnostic
              </span>
            </div>
          </div>

          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: levelColor.bg,
              color: levelColor.text,
              border: `1px solid ${levelColor.border}`,
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              <Sparkles size={14} />
              <span>Current Stage: {result.learningLevel}</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              {result.overallScore >= 75 ? 'Strong Foundation Identified' : result.overallScore >= 50 ? 'Developing Understanding' : 'Foundational Support Needed'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
              This baseline represents your current diagnostic checkpoint across uploaded topics, not a permanent academic grade.
            </p>
          </div>
        </div>

        {/* Right: Key Breakdown Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          borderLeft: '1px solid #E2E8F0',
          paddingLeft: '24px'
        }}>
          <div style={{
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Knowledge Accuracy (80%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4F46E5', marginTop: '2px' }}>
              {result.knowledgeScore}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              {result.correctAnswers} of {result.totalQuestions} correct
            </div>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Time Efficiency (20%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              {result.timeEfficiencyScore}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Avg {result.averageTimeSeconds}s per question
            </div>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Total Duration</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
              {formatSeconds(result.totalTimeSeconds)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Completed in one session
            </div>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Unanswered</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: result.unansweredAnswers > 0 ? '#D97706' : '#1E293B', marginTop: '2px' }}>
              {result.unansweredAnswers}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              {result.unansweredAnswers === 0 ? 'All attempted' : 'Skipped questions'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Diagnostic Narrative (Summary & Advice) */}
      {result.aiRecommendation && (
        <div className="card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
          border: '1.5px solid #C7D2FE'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <BrainCircuit size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#4F46E5', margin: 0 }}>
                GuruMitra AI Learning Advisor Evaluation
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 600 }}>
                Personalized conceptual summary derived from your response pattern
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#1E293B', lineHeight: '1.6', margin: '0 0 12px' }}>
            {result.aiRecommendation.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '12px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E0E7FF' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
                ✓ Key Demonstrated Strength
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                {result.aiRecommendation.strengthSummary}
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E0E7FF' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#D97706', marginBottom: '4px' }}>
                ! Key Focus Area
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                {result.aiRecommendation.gapSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Difficulty & Chapter Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Difficulty-wise Performance */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Performance by Difficulty
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              1 Easy, 1 Mod, 1 Diff per chapter
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Easy */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#059669' }}>Easy (Basic Recall & Definitions)</span>
                <span style={{ fontWeight: 800, color: '#1E293B' }}>
                  {result.difficultyPerformance.easy.accuracy}% ({result.difficultyPerformance.easy.correct}/{result.difficultyPerformance.easy.total})
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${result.difficultyPerformance.easy.accuracy}%`,
                  backgroundColor: '#10B981',
                  borderRadius: '999px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>

            {/* Moderate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#D97706' }}>Moderate (Application & Reasoning)</span>
                <span style={{ fontWeight: 800, color: '#1E293B' }}>
                  {result.difficultyPerformance.moderate.accuracy}% ({result.difficultyPerformance.moderate.correct}/{result.difficultyPerformance.moderate.total})
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${result.difficultyPerformance.moderate.accuracy}%`,
                  backgroundColor: '#F59E0B',
                  borderRadius: '999px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>

            {/* Difficult */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#7C3AED' }}>Difficult (Complex Problem Solving)</span>
                <span style={{ fontWeight: 800, color: '#1E293B' }}>
                  {result.difficultyPerformance.difficult.accuracy}% ({result.difficultyPerformance.difficult.correct}/{result.difficultyPerformance.difficult.total})
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${result.difficultyPerformance.difficult.accuracy}%`,
                  backgroundColor: '#8B5CF6',
                  borderRadius: '999px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Performance Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Chapter-Wise Diagnostics
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              {Object.keys(result.chapterPerformance).length} Chapters
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '220px', overflowY: 'auto' }}>
            {Object.entries(result.chapterPerformance).map(([chId, ch]) => (
              <div key={chId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>{ch.chapterName}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '6px' }}>
                      {ch.subject}
                    </span>
                  </div>
                  <span style={{ fontWeight: 800, color: ch.accuracy >= 70 ? '#059669' : ch.accuracy >= 50 ? '#D97706' : '#DC2626' }}>
                    {ch.accuracy}%
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${ch.accuracy}%`,
                    backgroundColor: ch.accuracy >= 70 ? '#10B981' : ch.accuracy >= 50 ? '#F59E0B' : '#EF4444',
                    borderRadius: '999px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Identified Knowledge Gaps (Traceable Evidence Chain) */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Identified Learning Gaps & Conceptual Weaknesses
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
              Multi-level diagnosis with verifiable question evidence and prerequisite tracking.
            </p>
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '999px',
            backgroundColor: result.identifiedGaps.length > 0 ? '#FEF2F2' : '#ECFDF5',
            color: result.identifiedGaps.length > 0 ? '#DC2626' : '#059669'
          }}>
            {result.identifiedGaps.length} Gaps Detected
          </span>
        </div>

        {result.identifiedGaps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#059669' }}>
            <CheckCircle2 size={36} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>No Critical Knowledge Gaps Detected!</div>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0' }}>
              You achieved solid mastery across all tested topics in the uploaded material.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {result.identifiedGaps.map((gap) => {
              const isExpanded = expandedGapId === gap.id;
              const isHighPriority = gap.priority === 'High Priority';

              return (
                <div
                  key={gap.id}
                  style={{
                    borderRadius: '14px',
                    border: isHighPriority ? '1.5px solid #FECACA' : '1px solid #E2E8F0',
                    backgroundColor: isHighPriority ? '#FEF2F2' : '#FFFFFF',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    onClick={() => setExpandedGapId(isExpanded ? null : gap.id)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlertTriangle size={18} color={isHighPriority ? '#DC2626' : '#D97706'} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>
                            {gap.topic}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 8px',
                            borderRadius: '999px',
                            backgroundColor: isHighPriority ? '#FEE2E2' : '#FEF3C7',
                            color: isHighPriority ? '#DC2626' : '#D97706'
                          }}>
                            {gap.priority}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Chapter: <strong>{gap.chapterName}</strong> ({gap.subject}) • Accuracy: {gap.accuracy}% ({gap.incorrectQuestions} error{gap.incorrectQuestions > 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {gap.prerequisite && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: '#EEF2FF',
                          color: '#4F46E5',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          Prereq: {gap.prerequisite}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                    </div>
                  </div>

                  {/* Expandable Evidence Chain */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 20px 16px',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      backgroundColor: '#FFFFFF'
                    }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', margin: '12px 0 8px', textTransform: 'uppercase' }}>
                        Verifiable Question Evidence Chain
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {gap.evidence.map((ev, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '10px',
                              backgroundColor: ev.isCorrect ? '#F0FDF4' : '#FFF1F2',
                              border: `1px solid ${ev.isCorrect ? '#BBF7D0' : '#FECDD3'}`,
                              fontSize: '0.82rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700, color: ev.isCorrect ? '#15803D' : '#BE123C' }}>
                                Question {ev.questionIndex} ({ev.difficulty.toUpperCase()} level) — {ev.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <p style={{ margin: '0 0 6px', color: '#1E293B', fontWeight: 600 }}>
                              "{ev.questionText}"
                            </p>
                            {!ev.isCorrect && (
                              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                <span>Your Answer: <strong style={{ color: '#BE123C' }}>{ev.userAnswerText}</strong></span>
                                <span style={{ margin: '0 8px' }}>•</span>
                                <span>Correct Answer: <strong style={{ color: '#15803D' }}>{ev.correctAnswerText}</strong></span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Next Actions: The Adaptive Bridge */}
      <div className="card" style={{
        padding: '28px',
        border: '1.5px solid #C7D2FE',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Target size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Your Tailored Adaptive Learning Path
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Generated directly from your diagnostic performance to maximize mastery
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {result.recommendedNextActions.map((action) => (
            <div
              key={action.step}
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {action.step}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748B'
                  }}>
                    {action.actionType.toUpperCase()}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: '0 0 4px' }}>
                  {action.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  {action.description}
                </p>
              </div>

              <button
                onClick={() => handleStartAction(action)}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.82rem', width: '100%', justifyContent: 'center' }}
              >
                <span>{action.actionType === 'review' ? 'Ask AI Tutor' : 'Start Study Session'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion: Review All Questions & Explanations */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <button
          onClick={() => setShowQuestionReview(!showQuestionReview)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={18} color="#4F46E5" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>
              Review Detailed Answers & Explanations ({result.questionPerformance.length} Questions)
            </span>
          </div>
          {showQuestionReview ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </button>

        {showQuestionReview && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {result.questionPerformance.map((qRec, index) => {
              const isCorrect = qRec.isCorrect;
              const hasOptions = Array.isArray(qRec.options) && qRec.options.length === 4;
              const userSelected = qRec.selectedOption;
              const correctOption = qRec.correctOption;

              return (
                <div
                  key={qRec.questionId}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: `1.5px solid ${isCorrect ? '#BBF7D0' : '#FECDD3'}`,
                    backgroundColor: isCorrect ? '#F0FDF4' : '#FFF1F2',
                    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Header bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: isCorrect ? '#15803D' : '#BE123C',
                        backgroundColor: isCorrect ? '#DCFCE7' : '#FFE4E6',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        Question {index + 1} • {isCorrect ? 'Correct' : userSelected === null || userSelected === undefined ? 'Unanswered' : 'Incorrect'}
                      </span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#64748B', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                        {qRec.chapterName}
                      </span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#64748B', border: '1px solid #E2E8F0', fontWeight: 600, textTransform: 'uppercase' }}>
                        {qRec.difficulty}
                      </span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 600 }}>
                        {qRec.topic}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748B' }}>
                      <Clock size={13} color="#64748B" />
                      <span>{qRec.timeSpentSeconds}s</span>
                      <span style={{ opacity: 0.6 }}>(Target: {qRec.expectedTimeSeconds}s)</span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div style={{
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    color: '#1E293B',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    backgroundColor: '#FFFFFF',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                  }}>
                    {qRec.questionText || `${qRec.topic}: Question ${index + 1}`}
                  </div>

                  {/* Options List with Vibrant Correct/Incorrect States */}
                  {hasOptions ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      {qRec.options!.map((optText, optIdx) => {
                        const isThisCorrect = optIdx === correctOption;
                        const isThisSelected = optIdx === userSelected;

                        let optBg = '#FFFFFF';
                        let optBorder = '#E2E8F0';
                        let optBadgeColor = '#64748B';
                        let badgeBg = '#F1F5F9';
                        let badgeText = '';

                        if (isThisCorrect) {
                          optBg = '#F0FDF4';
                          optBorder = '#10B981';
                          badgeBg = '#DCFCE7';
                          badgeText = '✓ Correct Answer';
                          optBadgeColor = '#15803D';
                        } else if (isThisSelected && !isCorrect) {
                          optBg = '#FEF2F2';
                          optBorder = '#EF4444';
                          badgeBg = '#FEE2E2';
                          badgeText = '✗ Your Selection (Incorrect)';
                          optBadgeColor = '#DC2626';
                        }

                        const letter = String.fromCharCode(65 + optIdx);

                        return (
                          <div
                            key={optIdx}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '10px',
                              border: `1.5px solid ${optBorder}`,
                              backgroundColor: optBg,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              position: 'relative'
                            }}
                          >
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              backgroundColor: isThisCorrect ? '#10B981' : isThisSelected ? '#EF4444' : '#E2E8F0',
                              color: isThisCorrect || isThisSelected ? '#FFFFFF' : '#475569',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {letter}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: isThisCorrect || isThisSelected ? 700 : 500, lineHeight: 1.4 }}>
                                {optText}
                              </div>
                              {badgeText && (
                                <span style={{
                                  display: 'inline-block',
                                  marginTop: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: optBadgeColor,
                                  backgroundColor: badgeBg,
                                  padding: '2px 8px',
                                  borderRadius: '4px'
                                }}>
                                  {badgeText}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ marginBottom: '14px', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                      <span style={{ color: '#BE123C', fontWeight: 600 }}>
                        Your Choice: Option {userSelected !== null && userSelected !== undefined ? String.fromCharCode(65 + userSelected) : 'Unanswered'}
                      </span>
                      <span style={{ margin: '0 8px' }}>•</span>
                      <span style={{ color: '#15803D', fontWeight: 700 }}>
                        Correct Choice: Option {String.fromCharCode(65 + correctOption)}
                      </span>
                    </div>
                  )}

                  {/* Summary Comparison & Educational Explanation */}
                  <div style={{
                    fontSize: '0.84rem',
                    color: '#334155',
                    backgroundColor: '#FFFFFF',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    lineHeight: 1.5
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#4F46E5', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      <Lightbulb size={14} />
                      <span>Step-by-Step Educational Explanation</span>
                    </div>
                    <div>
                      {qRec.explanation || `In ${qRec.chapterName}, "${qRec.topic}" tests ${qRec.difficulty} mastery. The correct answer is Option ${String.fromCharCode(65 + qRec.correctOption)}.`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
