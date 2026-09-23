import React from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Sparkles,
  ArrowUpRight,
  PieChart,
  Clock,
  Timer,
  Zap,
  Gauge,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { determineStudentPace } from '../services/quizEngine';

export const AnalyticsView: React.FC = () => {
  const { student, subjects, activities, lastQuizResult, setActiveTab, startQuizForCurrentTopic } = useStudent();

  // Weekly study activity mock
  const weeklyDays = [
    { day: 'Mon', hours: 1.5, lessons: 3 },
    { day: 'Tue', hours: 2.0, lessons: 4 },
    { day: 'Wed', hours: 1.2, lessons: 2 },
    { day: 'Thu', hours: 2.5, lessons: 5 },
    { day: 'Fri', hours: 1.8, lessons: 4 },
    { day: 'Sat', hours: 3.0, lessons: 6 },
    { day: 'Sun', hours: 2.2, lessons: 4 },
  ];

  // Subject benchmark response times
  const subjectPacingBenchmarks = [
    { subject: 'Mathematics', benchmark: '45s', category: 'Analytical Rigor', color: '#4F46E5', icon: '📐' },
    { subject: 'Science', benchmark: '32s', category: 'Conceptual Reasoning', color: '#10B981', icon: '🔬' },
    { subject: 'Computer Science', benchmark: '35s', category: 'Algorithmic Logic', color: '#06B6D4', icon: '💻' },
    { subject: 'English', benchmark: '28s', category: 'Comprehension Speed', color: '#F59E0B', icon: '📖' },
    { subject: 'Social Studies', benchmark: '24s', category: 'Factual Recall', color: '#EC4899', icon: '🌍' },
  ];

  const studentPace = determineStudentPace(student, lastQuizResult);

  const timedAnalytics = lastQuizResult?.timedQuizAnalytics;
  const avgResponseTimeDisplay = timedAnalytics
    ? `${Math.round(timedAnalytics.averageResponseTime)}s / question`
    : '34s / question';

  const timedAccuracyDisplay = timedAnalytics
    ? `${lastQuizResult.accuracy}%`
    : `${student.overallAccuracy}%`;

  const paceLabel =
    studentPace === 'Fast'
      ? 'Rapid & Fluent (Fast)'
      : studentPace === 'Needs More Time'
      ? 'Deliberate & Thorough (Needs More Time)'
      : 'Steady & Balanced (Normal)';

  const paceColor =
    studentPace === 'Fast'
      ? '#059669'
      : studentPace === 'Needs More Time'
      ? '#D97706'
      : '#4F46E5';

  return (
    <div style={{
      maxWidth: '1180px',
      margin: '0 auto',
      padding: '32px 32px 64px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
          Diagnostic Overview
        </span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
          Progress & Analytics
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.92rem', margin: 0 }}>
          Detailed performance metrics tracked across all active subjects and adaptive assessments.
        </p>
      </div>

      {/* Row 1: High Level KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
            OVERALL ACCURACY
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', margin: '6px 0 2px' }}>
            {student.overallAccuracy}%
          </div>
          <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
            ↑ 12% increase this week
          </span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
            LEARNING STREAK
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F97316', margin: '6px 0 2px' }}>
            {student.streak} Days 🔥
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
            Consistency on track
          </span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
            COMPLETED LESSONS
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4F46E5', margin: '6px 0 2px' }}>
            {student.completedLessons}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
            Curriculum milestone
          </span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
            CURRENT LEVEL
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E293B', margin: '6px 0 2px' }}>
            {student.level}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 700 }}>
            Dynamically adjusted
          </span>
        </div>
      </div>

      {/* Row 2: Exam Response & Timed Performance Diagnostics */}
      <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4F46E5'
              }}>
                <Timer size={18} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Exam Response & Timed Performance
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 40px' }}>
              Cognitive speed and accuracy evaluated simultaneously under simulated exam constraints.
            </p>
          </div>

          <button
            onClick={() => {
              startQuizForCurrentTopic();
              setActiveTab('quiz');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#4F46E5',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Zap size={14} /> Practice Timed Quiz
          </button>
        </div>

        {/* 4 Timed Performance Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Avg Response Time
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', margin: '4px 0' }}>
              {avgResponseTimeDisplay}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
              ✓ Well within 60s target
            </span>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Exam Accuracy
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981', margin: '4px 0' }}>
              {timedAccuracyDisplay}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Under time pressure
            </span>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Pacing & Fluency
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: paceColor, margin: '6px 0 2px' }}>
              {paceLabel}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Accuracy prioritised over speed
            </span>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Attempt Rate
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4F46E5', margin: '4px 0' }}>
              {timedAnalytics ? `${timedAnalytics.questionsAnswered} / ${timedAnalytics.questionsAnswered + timedAnalytics.questionsSkipped}` : '100%'}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              {timedAnalytics && timedAnalytics.questionsSkipped > 0
                ? `${timedAnalytics.questionsSkipped} questions skipped`
                : 'Zero skipped questions'}
            </span>
          </div>
        </div>

        {/* Live Assessment Insight vs Subject Pacing */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '20px'
        }}>
          {/* Diagnostic Matrix Explanation or Recent Assessment */}
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: timedAnalytics ? '#EEF2FF' : '#F8FAFC',
            border: `1.5px solid ${timedAnalytics ? '#C7D2FE' : '#E2E8F0'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Gauge size={18} color="#4F46E5" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                {timedAnalytics ? `Latest Timed Assessment: ${lastQuizResult.topic}` : 'Speed × Accuracy Diagnostic Matrix'}
              </h4>
            </div>

            {timedAnalytics ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: 1.5, margin: 0 }}>
                  <strong>Diagnostic Finding:</strong> {timedAnalytics.performanceInsight}
                </p>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #C7D2FE',
                  fontSize: '0.82rem',
                  color: '#4F46E5',
                  fontWeight: 600
                }}>
                  🎯 <strong>Recommended Next Step:</strong> {timedAnalytics.recommendedNextStep}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  <span>⚡ Fastest: <strong>{timedAnalytics.fastestResponseTime}s</strong></span>
                  <span>🐢 Slowest: <strong>{timedAnalytics.slowestResponseTime}s</strong></span>
                  <span>⏱ Total Time: <strong>{Math.floor(timedAnalytics.totalTimeUsed / 60)}m {timedAnalytics.totalTimeUsed % 60}s</strong></span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  GuruMitra measures your response time per question without penalising careful thought. Speed is never rewarded if accuracy drops:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#065F46' }}>High Acc + Fast Pace:</strong>
                    <div style={{ color: '#047857' }}>Fluent mastery. Ready for harder topics.</div>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#1E40AF' }}>High Acc + Slow Pace:</strong>
                    <div style={{ color: '#1D4ED8' }}>Strong concepts. Practice recall drills.</div>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#991B1B' }}>Low Acc + Fast Pace:</strong>
                    <div style={{ color: '#B91C1C' }}>Rushing warning. Slow down & read questions.</div>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#92400E' }}>Low Acc + Slow Pace:</strong>
                    <div style={{ color: '#B45309' }}>Foundational gap. Review topic explanation.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subject Pacing Benchmarks */}
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', marginBottom: '12px' }}>
              Target Response Times by Subject
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {subjectPacingBenchmarks.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{b.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>{b.subject}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>({b.category})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: b.color }}>~{b.benchmark}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>/ q</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Subject Performance Bars + Weekly Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
        gap: '24px'
      }}>
        {/* Subject Accuracy List matching Section 16 */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
              Subject Performance
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Accuracy Benchmarks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {subjects.map((sub) => (
              <div key={sub.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{sub.icon}</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
                      {sub.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: sub.color }}>
                    {sub.accuracy}%
                  </span>
                </div>

                <div className="progress-bar-container" style={{ height: '8px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${sub.accuracy}%`,
                      background: `linear-gradient(90deg, ${sub.color} 0%, ${sub.color}cc 100%)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
                Weekly Activity
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                Study Hours
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '160px',
              paddingTop: '20px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '12px'
            }}>
              {weeklyDays.map((d, i) => {
                const heightPercent = (d.hours / 3.0) * 100;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '32px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: `${heightPercent}%`,
                        background: 'linear-gradient(180deg, #4F46E5 0%, #818CF8 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease'
                      }}
                      title={`${d.hours} hrs (${d.lessons} lessons)`}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Total This Week:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>14.2 Hours • 28 Lessons</span>
          </div>
        </div>
      </div>

      {/* Row 4: Strengths vs Weaknesses Breakdown */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', marginBottom: '20px' }}>
          Diagnostic Strengths & Improvement Areas
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          {/* Strong Areas */}
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #BBF7D0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CheckCircle2 size={18} color="#15803D" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#15803D', margin: 0 }}>
                Strong Areas (Mastery &gt; 80%)
              </h4>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Reading Comprehension (English)', 'Algebra (Math)', 'Covalent Bonding (Science)', 'Python Loops (CS)', 'Indian Constitution (SST)', 'Trigonometry (Math)'].map((st, i) => (
                <span key={i} className="badge badge-on-track" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                  ✓ {st}
                </span>
              ))}
            </div>
          </div>

          {/* Weak Areas needing revision */}
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FECACA'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <TrendingUp size={18} color="#DC2626" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#B91C1C', margin: 0 }}>
                Areas Needing Practice (Mastery &lt; 65%)
              </h4>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Geometry: Triangles (Math)', 'Functional Groups (Science)', 'Binary Tree Traversals (CS)', 'Active/Passive Voice (English)', 'Historical Timelines (SST)'].map((wk, i) => (
                <span key={i} className="badge badge-high-priority" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                  ! {wk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
