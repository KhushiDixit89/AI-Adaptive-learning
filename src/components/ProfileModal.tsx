import React, { useState, useEffect } from 'react';
import {
  User,
  Camera,
  CheckCircle2,
  Sparkles,
  Save,
  LogIn,
  KeyRound,
  Mail,
  ArrowRight,
  Shield,
  LogOut,
  Clock,
  Check,
  GraduationCap,
  Bell
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { LearningStyle, ClassLevel, BoardType, StreamType, DifficultyLevel } from '../types';
import { getAvailableSubjects, normalizeGrade } from '../services/curriculumService';

export const ProfileModal: React.FC = () => {
  const { student, updateProfile, setAcademicProfile, setActiveTab, reminderSettings, updateReminderSettings } = useStudent();
  const { user, logout } = useAuth();
  const [activeSubView, setActiveSubView] = useState<'profile' | 'reminders' | 'account'>('profile');

  // Form states initialized with current student
  const [name, setName] = useState(student.name);
  const [grade, setGrade] = useState<ClassLevel>(normalizeGrade(student.grade));
  const [board, setBoard] = useState<BoardType>(student.board || 'CBSE');
  const [stream, setStream] = useState<StreamType>(student.stream || 'Not applicable');
  const [level, setLevel] = useState<DifficultyLevel>(student.level || 'Beginner');
  const [style, setStyle] = useState<LearningStyle>(student.preferredStyle);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Reminder form states
  const [remindersEnabled, setRemindersEnabled] = useState(reminderSettings.enabled);
  const [prefTime, setPrefTime] = useState(reminderSettings.preferredTime || '18:00');
  const [remFreq, setRemFreq] = useState<'daily' | 'weekdays' | 'custom'>(reminderSettings.frequency || 'daily');
  const [remUnfinished, setRemUnfinished] = useState(reminderSettings.remindUnfinishedLessons);
  const [remQuizzes, setRemQuizzes] = useState(reminderSettings.remindPendingQuizzes);
  const [remWeak, setRemWeak] = useState(reminderSettings.remindWeakTopics);
  const [reminderSavedSuccess, setReminderSavedSuccess] = useState(false);

  // Sync state if student changes
  useEffect(() => {
    setName(student.name);
    const norm = normalizeGrade(student.grade);
    setGrade(norm);
    setBoard(student.board || 'CBSE');
    setStream(student.stream || 'Not applicable');
    setLevel(student.level || 'Beginner');
    setStyle(student.preferredStyle);
  }, [student]);

  // Handle Class changes: disable or reset stream for Class 6-10
  const handleGradeChange = (newGrade: ClassLevel) => {
    setGrade(newGrade);
    const isSenior = newGrade === 'Class 11' || newGrade === 'Class 12';
    if (!isSenior) {
      setStream('Not applicable');
    } else if (stream === 'Not applicable') {
      setStream('Science');
    }
  };

  const isSeniorClass = grade === 'Class 11' || grade === 'Class 12';

  // Dynamic preview of subjects that will be enrolled
  const previewSubjects = getAvailableSubjects(grade, board, stream);

  const initials = student.name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ST';

  const handleSave = () => {
    setAcademicProfile(grade, board, stream, style, level);
    updateProfile(name, grade, style, board, stream);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveReminders = () => {
    updateReminderSettings({
      enabled: remindersEnabled,
      preferredTime: prefTime,
      frequency: remFreq,
      remindUnfinishedLessons: remUnfinished,
      remindPendingQuizzes: remQuizzes,
      remindWeakTopics: remWeak
    });
    setReminderSavedSuccess(true);
    setTimeout(() => setReminderSavedSuccess(false), 3000);
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '32px 24px 64px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Tab Switcher between Profile, Reminders, and Account */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveSubView('profile')}
          className={`btn ${activeSubView === 'profile' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <User size={16} />
          <span>Student Academic Profile</span>
        </button>
        <button
          onClick={() => setActiveSubView('reminders')}
          className={`btn ${activeSubView === 'reminders' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <Bell size={16} />
          <span>Study Reminders</span>
        </button>
        <button
          onClick={() => setActiveSubView('account')}
          className={`btn ${activeSubView === 'account' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <Shield size={16} />
          <span>Account & Security</span>
        </button>
      </div>

      {activeSubView === 'profile' && (
        /* PANEL: Student Profile Setup */
        <div className="card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
              <GraduationCap size={16} />
              <span>Academic Personalization Engine</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
              Student Academic Profile
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              Calibrate your class, board, stream, and learning style. The entire GuruMitra AI curriculum dynamically adapts to your configuration.
            </p>
          </div>

          {/* Avatar with Initials */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                fontSize: '2rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)'
              }}>
                {initials}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF',
                cursor: 'pointer'
              }}>
                <Camera size={14} />
              </div>
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
              Student Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-family)',
                outline: 'none'
              }}
            />
          </div>

          {/* ACADEMIC PROFILE SECTION */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color="#4F46E5" />
              <span>Academic Calibration</span>
            </h3>

            {/* 4 Academic Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
              {/* CLASS DROPDOWN */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  CLASS
                </label>
                <select
                  value={grade}
                  onChange={(e) => handleGradeChange(e.target.value as ClassLevel)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none'
                  }}
                >
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              {/* BOARD DROPDOWN */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  BOARD
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value as BoardType)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none'
                  }}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="UP Board">UP Board</option>
                </select>
              </div>

              {/* STREAM DROPDOWN (Disabled for 6-10, Enabled for 11-12) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  STREAM
                </label>
                <select
                  value={stream}
                  disabled={!isSeniorClass}
                  onChange={(e) => setStream(e.target.value as StreamType)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    backgroundColor: isSeniorClass ? '#FFFFFF' : '#F1F5F9',
                    color: isSeniorClass ? '#1E293B' : '#94A3B8',
                    cursor: isSeniorClass ? 'default' : 'not-allowed',
                    outline: 'none'
                  }}
                >
                  {!isSeniorClass ? (
                    <option value="Not applicable">Not applicable</option>
                  ) : (
                    <>
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Humanities / Arts">Humanities / Arts</option>
                    </>
                  )}
                </select>
              </div>

              {/* DIFFICULTY LEVEL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  DIFFICULTY
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none'
                  }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Dynamically Calibrated Subjects Preview */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>
                  Enrolled Subjects ({grade} • {board} {stream !== 'Not applicable' ? `• ${stream}` : ''})
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5' }}>
                  {previewSubjects.length} Subjects Calibrated
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {previewSubjects.map((sub) => (
                  <span
                    key={sub.name}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      backgroundColor: sub.bgLight,
                      color: sub.color,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      border: `1px solid ${sub.color}30`
                    }}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Learning Style 4 Cards */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '12px' }}>
              Preferred Learning Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { id: 'Simple', icon: '💡', title: 'Simple', desc: 'Easy & clear explanations' },
                { id: 'Analogy', icon: '🧩', title: 'Analogy', desc: 'Real-life examples & comparisons' },
                { id: 'Visual', icon: '👁️', title: 'Visual', desc: 'Diagrams & images' },
                { id: 'Exam-oriented', icon: '📝', title: 'Exam-oriented', desc: 'Important points & practice' },
              ].map((item) => {
                const isSelected = style === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setStyle(item.id as any)}
                    style={{
                      padding: '16px 12px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #4F46E5' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', marginBottom: '6px', display: 'block' }}>
                      {item.icon}
                    </span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? '#4F46E5' : '#1E293B', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: isSelected ? '#4338CA' : '#64748B', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            {savedSuccess ? (
              <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                Academic profile saved! Curriculum re-calibrated.
              </span>
            ) : (
              <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                Preferences will instantly apply across all subjects, AI Tutor, and study lessons
              </span>
            )}

            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
            >
              <Save size={16} />
              <span>Save Academic Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* PANEL: Study Reminders & Settings */}
      {activeSubView === 'reminders' && (
        <div className="card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
              <Bell size={16} />
              <span>Smart Study Habit Engine</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
              Study Reminders & Settings
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              Configure proactive, context-aware reminders so GuruMitra keeps your learning momentum consistent without becoming intrusive.
            </p>
          </div>

          {/* Master Enable Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: remindersEnabled ? '#EEF2FF' : '#F8FAFC',
            border: remindersEnabled ? '1.5px solid #C7D2FE' : '1px solid #E2E8F0'
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                Study Reminders
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                {remindersEnabled ? 'Proactive notifications active based on your learning schedule' : 'Reminders are currently paused'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              style={{
                background: remindersEnabled ? '#4F46E5' : '#E2E8F0',
                color: remindersEnabled ? '#FFFFFF' : '#64748B',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {remindersEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Preferred Study Time */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              Preferred Study Time
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="time"
                value={prefTime}
                onChange={(e) => setPrefTime(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF',
                  width: '180px'
                }}
              />
              <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                (Set your preferred daily learning window)
              </span>
            </div>
          </div>

          {/* Reminder Frequency */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              Reminder Frequency
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['daily', 'weekdays', 'custom'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setRemFreq(freq)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: remFreq === freq ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                    backgroundColor: remFreq === freq ? '#EEF2FF' : '#FFFFFF',
                    color: remFreq === freq ? '#4F46E5' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer'
                  }}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Context Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              Contextual Triggers
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={remUnfinished}
                onChange={(e) => setRemUnfinished(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#4F46E5' }}
              />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>
                  Remind me about unfinished lessons
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Prompt to continue active chapters like {student.grade} Mathematics
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={remQuizzes}
                onChange={(e) => setRemQuizzes(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#4F46E5' }}
              />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>
                  Remind me about pending quizzes
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Prompt to take chapter diagnostic assessments after reading lessons
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={remWeak}
                onChange={(e) => setRemWeak(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#4F46E5' }}
              />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>
                  Remind me to revise weak topics
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Prioritize 10-minute micro-drills on topics flagged with lower accuracy
                </div>
              </div>
            </label>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            {reminderSavedSuccess && (
              <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} />
                <span>Reminder Settings Saved!</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveReminders}
              className="btn btn-primary"
              style={{ padding: '10px 24px', borderRadius: '12px' }}
            >
              <Save size={16} />
              <span>Save Reminder Settings</span>
            </button>
          </div>
        </div>
      )}

      {activeSubView === 'account' && (
        /* PANEL: Account & Security */
        <div className="card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
              Authentication & Session
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
              Account & Security
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              Manage your active login session, account credentials, and system access.
            </p>
          </div>

          {/* Active Session Card */}
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                fontSize: '1.25rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(79, 70, 229, 0.25)'
              }}>
                {initials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {student.name}
                  </h3>
                </div>
                <div style={{ fontSize: '0.86rem', color: '#64748B', marginTop: '2px' }}>
                  {user?.email || ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#15803D',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                <span>Supabase Session Active</span>
              </div>
            </div>
          </div>

          {/* Account Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Learning Level</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '4px' }}>
                {student.level}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Class / Grade</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '4px' }}>
                Class {student.grade}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Auth Engine</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '4px' }}>
                Supabase Auth
              </div>
            </div>
          </div>

          {/* Session Termination & Logout Box */}
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '8px'
          }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#991B1B' }}>
                Terminate Current Session
              </div>
              <p style={{ fontSize: '0.82rem', color: '#B91C1C', margin: '4px 0 0' }}>
                Logging out will clear your local authentication token and return you to the Login screen.
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="btn"
              style={{
                background: '#DC2626',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
