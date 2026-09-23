import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { SubjectType } from '../types';
import {
  BookOpen,
  FileText,
  ExternalLink,
  Loader2,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const SyllabusAnalysisView: React.FC = () => {
  const { user } = useAuth();
  const { student, setActiveTab, setActiveSubject, activeSubject } = useStudent();
  const [isLoading, setIsLoading] = useState(false);

  // Get subjects that have syllabus data
  const syllabusData = student.syllabusData ?? {};
  const subjectsWithData = Object.keys(syllabusData) as SubjectType[];

  // Determine active subject: if none set in context or not in list, pick first subject with data
  const currentSubject: SubjectType | null = (activeSubject && subjectsWithData.includes(activeSubject))
    ? activeSubject
    : (subjectsWithData.length > 0 ? subjectsWithData[0] : null);

  const syllabusInfo = currentSubject && syllabusData[currentSubject] ? syllabusData[currentSubject] : null;

  // Multi-subject stepper index
  const currentIndex = currentSubject ? subjectsWithData.indexOf(currentSubject) : -1;
  const isLastSubject = currentIndex === subjectsWithData.length - 1;
  const nextSubjectName = !isLastSubject && currentIndex >= 0 ? subjectsWithData[currentIndex + 1] : null;

  const handleNextSubject = () => {
    if (nextSubjectName) {
      setActiveSubject(nextSubjectName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartTest = () => {
    setIsLoading(true);
    if (currentSubject) {
      setActiveSubject(currentSubject);
    }
    setActiveTab('pre-assessment');
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const handleBack = () => {
    if (!student.syllabusUploaded) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('upload');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: 600
            }}
          >
            <SkipForward size={18} />
            <span>Back to Upload</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 size={32} color="#4F46E5" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', color: '#64748B' }}>Loading diagnostic assessment...</p>
          </div>
        )}

        {/* Tabs for subjects */}
        {!isLoading && subjectsWithData.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            overflowX: 'auto',
            paddingBottom: '8px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            {subjectsWithData.map((subject, idx) => {
              const isActive = subject === currentSubject;
              return (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #4F46E5' : '3px solid transparent',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    borderRadius: '8px 8px 0 0',
                    color: isActive ? '#1E293B' : '#64748B',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 700 : 600,
                    fontFamily: 'var(--font-family)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>
                    {subject === 'Mathematics' && '📐'}
                    {subject === 'Science' && '🔬'}
                    {subject === 'English' && '📖'}
                    {subject === 'Computer Science' && '💻'}
                    {subject === 'Social Science' && '🌍'}
                  </span>
                  <span>{subject}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#EEF2FF' : '#F1F5F9',
                    color: isActive ? '#4F46E5' : '#64748B',
                    fontWeight: 700
                  }}>
                    {idx + 1}/{subjectsWithData.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {!isLoading && syllabusInfo ? (
          <>
            {/* Subject Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '30px',
                boxShadow: 'var(--shadow-primary)'
              }}>
                {currentSubject === 'Mathematics' && '📐'}
                {currentSubject === 'Science' && '🔬'}
                {currentSubject === 'English' && '📖'}
                {currentSubject === 'Computer Science' && '💻'}
                {currentSubject === 'Social Science' && '🌍'}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                {currentSubject} Syllabus Analysis
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
                Extracted chapters directly from your syllabus PDF
              </p>
            </div>

            {/* Original Syllabus Source Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '24px', marginBottom: '24px', border: '1.5px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={22} color="#4F46E5" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: '0' }}>
                      Source Document
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0' }}>
                      {syllabusInfo.fileName || 'Uploaded Syllabus PDF'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px'
                  }}>
                    <CheckCircle2 size={14} />
                    Text Extracted
                  </span>
                  {syllabusInfo.publicUrl && (
                    <a
                      href={syllabusInfo.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#4F46E5',
                        fontWeight: 600,
                        textDecoration: 'none',
                        border: '1px solid #C7D2FE',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        backgroundColor: '#F8FAFC'
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>View PDF</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Extracted Chapters List (from PDF text) */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '24px', marginBottom: '32px', border: '1.5px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#F0FDF4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen size={20} color="#16A34A" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', margin: '0' }}>
                    Extracted Chapters & Units
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0' }}>
                    Directly extracted from the text in your PDF syllabus
                  </p>
                </div>
              </div>

              {syllabusInfo.topics && syllabusInfo.topics.length > 0 ? (
                <ol style={{
                  paddingLeft: '24px',
                  margin: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {syllabusInfo.topics.map((chapter, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: '0.98rem',
                        color: '#1E293B',
                        fontWeight: 600,
                        lineHeight: '1.5'
                      }}
                    >
                      <span>{chapter}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p style={{ fontSize: '0.9rem', color: '#94A3B8', textAlign: 'center', marginTop: '12px' }}>
                  No chapters detected from the syllabus. Please check the PDF content.
                </p>
              )}
            </div>

            {/* Stepper Navigation / Actions */}
            <div style={{
              display: 'flex',
              flexDirection: isLastSubject ? 'column' : 'row',
              gap: '12px',
              alignItems: 'stretch'
            }}>
              {!isLastSubject && nextSubjectName && (
                <button
                  onClick={handleNextSubject}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Next Subject: {nextSubjectName}</span>
                  <ChevronRight size={20} />
                </button>
              )}

              <button
                onClick={handleStartTest}
                disabled={isLoading}
                className={isLastSubject ? 'btn btn-primary' : 'btn btn-outline'}
                style={{
                  flex: isLastSubject ? 'none' : 1,
                  width: isLastSubject ? '100%' : 'auto',
                  padding: '16px 32px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Preparing your diagnostic test...</span>
                  </>
                ) : (
                  <>
                    <span>Start Diagnostic Pre-Assessment</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Error / No Data State */
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1.5px solid var(--border-subtle)' }}>
            <BookOpen size={48} color="#94A3B8" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>
              No Analysis Data
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.5' }}>
              No syllabus analysis data found. Please upload a syllabus first.
            </p>
            <button
              onClick={handleBack}
              className="btn btn-outline"
              style={{ fontSize: '0.9rem' }}
            >
              <SkipForward size={16} />
              <span>Go to Upload</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
