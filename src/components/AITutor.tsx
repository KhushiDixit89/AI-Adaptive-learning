import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Eye,
  Paperclip,
  X,
  FileText,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Code2,
  Key
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { SubjectType, LearningStyle, TutorMessage } from '../types';
import { generateTutorAnswer } from '../services/aiTutorService';

export const AITutor: React.FC = () => {
  const {
    student,
    activeSubject,
    setActiveSubject,
    setPreferredStyle,
    uploadedMaterial,
    uploadState,
    removeUploadedMaterial,
    processAndSetFile,
    subjects,
    currentLearningContext
  } = useStudent();

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'tutor',
      text: `Hello! I am your AI Adaptive Companion GuruMitra. Select any subject above, choose your preferred learning style, or ask me anything from your ${student.grade || 'Class 9'} (${student.board || 'CBSE'}) syllabus!`,
      timestamp: 'Just now',
      subject: activeSubject,
      styleUsed: student.preferredStyle,
      structuredResponse: {
        responseType: 'conceptual',
        directAnswer: `Welcome to your personal AI Tutor for ${activeSubject}!`,
        simpleExplanation: `I'm calibrated for your active curriculum (${student.grade || 'Class 9'} • ${student.board || 'CBSE'}${student.stream && student.stream !== 'Not applicable' ? ' • ' + student.stream : ''} • ${student.level || 'Beginner'}). Whether you need step-by-step math calculations, science mechanisms, or commerce fundamentals, I will adapt my explanations to match your preferred style.`,
        keyConcept: 'Adaptive Learning: Choose between Simple, Analogy, Visual, or Exam-oriented modes anytime above.',
        example: 'Try asking: "Solve 2x + 5 = 15", "Explain photosynthesis", "What are functional groups in chemistry?", "Explain kinematics equations", or "What is the accounting equation?".',
        practiceQuestion: {
          question: 'Ready to learn? Which topic would you like to explore first?',
          answer: 'You can also attach a PDF or notes file to get instant tutoring on your own study material!'
        }
      }
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState<Record<string, boolean>>({});
  const [emptyQueryAlert, setEmptyQueryAlert] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('gpt-4o-mini');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [saveKeyError, setSaveKeyError] = useState<string | null>(null);
  const [saveKeySuccess, setSaveKeySuccess] = useState<string | null>(null);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSubjectIconAndColor = (name: string) => {
    const map: Record<string, { icon: string; color: string }> = {
      Mathematics: { icon: '📐', color: '#4F46E5' },
      Ganit: { icon: '📐', color: '#4F46E5' },
      Science: { icon: '🔬', color: '#059669' },
      Vigyan: { icon: '🔬', color: '#059669' },
      Physics: { icon: '⚡', color: '#2563EB' },
      Chemistry: { icon: '🧪', color: '#7C3AED' },
      Biology: { icon: '🧬', color: '#059669' },
      'Computer Science': { icon: '💻', color: '#6366F1' },
      English: { icon: '📖', color: '#D97706' },
      'Social Science': { icon: '🌍', color: '#DC2626' },
      'Samajik Vigyan': { icon: '🌍', color: '#DC2626' },
      Hindi: { icon: '📝', color: '#EA580C' },
      Accountancy: { icon: '📊', color: '#0D9488' },
      'Business Studies': { icon: '💼', color: '#475569' },
      Economics: { icon: '📈', color: '#B45309' },
      History: { icon: '🏛️', color: '#9333EA' },
      'Political Science': { icon: '⚖️', color: '#1D4ED8' },
      Geography: { icon: '🗺️', color: '#15803D' }
    };
    return map[name] || { icon: '📚', color: '#4F46E5' };
  };

  const subjectsList = subjects.map((s) => {
    const styling = getSubjectIconAndColor(s.name);
    return { name: s.name, icon: styling.icon, color: styling.color };
  });

  const defaultSubjectQuestions: Record<string, string[]> = {
    Mathematics: [
      'Solve 2x + 5 = 15',
      'Explain quadratic equations',
      'What is Pythagoras theorem?',
      'Explain probability'
    ],
    Ganit: [
      'रैखिक समीकरण 2x + 5 = 15 हल करें',
      'द्विघात समीकरण क्या है?',
      'पाइथागोरस प्रमेय समझाइए'
    ],
    Science: [
      'Explain photosynthesis',
      'What is Newton\'s second law?',
      'Explain the human digestive system',
      'What is an atom?'
    ],
    Vigyan: [
      'प्रकाश का परावर्तन क्या है?',
      'न्यूटन के गति के नियम समझाइए',
      'प्रकाश संश्लेषण की क्रिया'
    ],
    Physics: [
      'What are the kinematic equations of motion?',
      'Explain Ohm\'s law with circuit examples',
      'What is Snell\'s law of refraction?',
      'Explain Newton\'s second law of motion'
    ],
    Chemistry: [
      'What are functional groups in organic chemistry?',
      'Explain types of chemical reactions',
      'What is the difference between an acid and a base?',
      'How does covalent bonding work?'
    ],
    Biology: [
      'Explain the process of photosynthesis',
      'How does the human digestive system work?',
      'What are Mendel\'s laws of inheritance?',
      'Explain the difference between plant and animal cells'
    ],
    'Computer Science': [
      'What is a binary tree?',
      'Explain recursion',
      'What is an array?',
      'Give me a Python example of a loop',
      'What is time complexity?'
    ],
    English: [
      'Explain nouns and pronouns',
      'Correct this sentence',
      'What is a metaphor?',
      'Explain active and passive voice'
    ],
    'Social Science': [
      'Explain the Indian Constitution',
      'What is democracy?',
      'Explain the causes of the French Revolution',
      'What is the role of the Parliament?'
    ],
    'Samajik Vigyan': [
      'भारतीय संविधान की प्रस्तावना',
      'लोकतंत्र की मुख्य विशेषताएं',
      'फ्रांसीसी क्रांति के कारण'
    ],
    Accountancy: [
      'Explain the accounting equation Assets = Liabilities + Capital',
      'What are the golden rules of accounting?',
      'How to prepare a balance sheet?'
    ],
    'Business Studies': [
      'What are Fayol\'s principles of management?',
      'Explain the 4 Ps of the marketing mix',
      'What is the importance of planning in business?'
    ],
    Economics: [
      'Explain the Law of Demand and demand curves',
      'What is Gross Domestic Product (GDP)?',
      'What causes inflation and how is it controlled?'
    ]
  };

  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(
    defaultSubjectQuestions[activeSubject] || [
      'Explain the core concepts of this subject',
      'Give me an exam-style practice question',
      'What are the most important formulas/definitions?'
    ]
  );

  const stylePills: LearningStyle[] = ['Simple', 'Analogy', 'Visual', 'Exam-oriented'];

  // When active subject changes, update initial suggestions if user hasn't asked follow-up
  useEffect(() => {
    if (uploadedMaterial) {
      setActiveSuggestions([
        'Summarize this document',
        'What are the key points in this material?',
        'Give me 3 practice quiz questions from this file',
        'Explain the difficult concepts in simple words'
      ]);
    } else {
      setActiveSuggestions(
        defaultSubjectQuestions[activeSubject] || [
          `Explain core concepts in ${activeSubject}`,
          `Key exam questions for ${activeSubject}`,
          `Formula sheet for ${activeSubject}`
        ]
      );
    }
  }, [activeSubject, uploadedMaterial]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    fetch('/api/ai-tutor/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.configured === 'boolean') {
          setApiConfigured(data.configured);
          if (data.model) setModelInput(data.model);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setSaveKeyError('Please enter a valid OpenAI API key (starts with sk-).');
      return;
    }
    setIsSavingKey(true);
    setSaveKeyError(null);
    setSaveKeySuccess(null);

    try {
      const res = await fetch('/api/ai-tutor/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim(),
          model: modelInput
        })
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setApiConfigured(true);
        setIsOfflineMode(false);
        setSaveKeySuccess('OpenAI API Key configured successfully! Live AI Tutor is now active.');
        setTimeout(() => {
          setIsConfigModalOpen(false);
          setSaveKeySuccess(null);
          setApiKeyInput('');
        }, 1200);
      } else {
        setSaveKeyError(data?.error || 'Failed to save API key. Please check permissions.');
      }
    } catch (err: any) {
      setSaveKeyError(err?.message || 'Connection error while saving key.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleSendMessage = async (textToSend?: string, forceOffline?: boolean) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) {
      setEmptyQueryAlert(true);
      setTimeout(() => setEmptyQueryAlert(false), 3000);
      return;
    }

    setEmptyQueryAlert(false);

    const userMessage: TutorMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      text: query,
      timestamp: 'Just now',
      subject: activeSubject,
      attachedFile: uploadedMaterial?.fileName
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    const useOffline = forceOffline !== undefined ? forceOffline : isOfflineMode;

    try {
      // Call scalable AI Tutor Service with rich educational reasoning
      const responseStructure = await generateTutorAnswer({
        question: query,
        subject: activeSubject,
        learningStyle: student.preferredStyle,
        gradeLevel: student.grade || 'Class 9',
        board: student.board,
        stream: student.stream,
        difficulty: student.level || 'Beginner',
        chapter: currentLearningContext.chapter,
        topic: currentLearningContext.topic,
        uploadedContext: uploadedMaterial
          ? {
              fileName: uploadedMaterial.fileName,
              fileType: uploadedMaterial.fileType,
              extractedText: uploadedMaterial.extractedText
            }
          : null,
        conversationHistory: messages,
        offlineMode: useOffline
      });

      const botMessage: TutorMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: responseStructure.directAnswer,
        timestamp: 'Just now',
        subject: activeSubject,
        styleUsed: student.preferredStyle,
        structuredResponse: responseStructure
      };

      setMessages((prev) => [...prev, botMessage]);

      // Update follow-up suggested questions dynamically based on answer!
      if (responseStructure.followUpQuestions && responseStructure.followUpQuestions.length > 0) {
        setActiveSuggestions(responseStructure.followUpQuestions);
      }
    } catch (err: any) {
      const errorText = err?.message || "AI Tutor is temporarily unavailable. Please try again.";
      const errorMsg: TutorMessage = {
        id: `tutor-err-${Date.now()}`,
        sender: 'tutor',
        text: errorText,
        timestamp: 'Just now',
        subject: activeSubject,
        styleUsed: student.preferredStyle,
        structuredResponse: {
          directAnswer: errorText,
          simpleExplanation: errorText.includes('not configured')
            ? 'Add OPENAI_API_KEY to the server environment (.env file) and restart the server to enable live tutoring.'
            : 'AI Tutor is temporarily unavailable. Please try again.',
          keyConcept: errorText.includes('not configured') ? 'Environment Configuration' : 'Service Notice'
        }
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        await processAndSetFile(files[0]);
      } catch {
        // Error notification handled in context
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div style={{
      maxWidth: '1180px',
      margin: '0 auto',
      padding: '24px 32px 64px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: 'calc(100vh - 74px)'
    }}>
      {/* Hidden file input for quick attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleQuickFileUpload}
        accept=".pdf,.doc,.docx,.txt,.text,.md,.csv,.json"
        style={{ display: 'none' }}
      />

      {/* Top Controls: Header, Subject Selector & Learning Style Modifier */}
      <div className="card" style={{ padding: '18px 24px', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Bot size={18} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                AI Tutor
              </h2>
              <span className="badge badge-info">
                Multi-Subject Context Aware
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 40px' }}>
              Ask anything, anytime. Switches domain, question type, and pedagogical style dynamically.
            </p>
          </div>

          {/* Subject Pills / Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Subject:
            </span>
            {subjectsList.map((sub) => {
              const isSelected = activeSubject === sub.name;
              return (
                <button
                  key={sub.name}
                  onClick={() => setActiveSubject(sub.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: isSelected ? `2px solid ${sub.color}` : '1px solid var(--border-subtle)',
                    background: isSelected ? `${sub.color}15` : '#FFFFFF',
                    color: isSelected ? sub.color : '#64748B',
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Selector Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid #F1F5F9',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5', letterSpacing: '0.03em' }}>
              ADAPTIVE EXPLANATION STYLE:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {stylePills.map((style) => (
                <button
                  key={style}
                  onClick={() => setPreferredStyle(style)}
                  className={`style-pill ${student.preferredStyle === style ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  {style === 'Simple' && '💡'}
                  {style === 'Analogy' && '🧩'}
                  {style === 'Visual' && '👁️'}
                  {style === 'Exam-oriented' && '📝'}
                  <span>{style}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Status / Configure Button */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '999px',
                border: apiConfigured ? '1px solid #BBF7D0' : '1px solid #FCD34D',
                backgroundColor: apiConfigured ? '#F0FDF4' : '#FEF3C7',
                color: apiConfigured ? '#15803D' : '#B45309',
                cursor: 'pointer'
              }}
              title="Click to configure OpenAI API Key"
            >
              <Key size={13} />
              <span>{apiConfigured ? `OpenAI Connected (${modelInput})` : 'Configure API Key'}</span>
            </button>

            {/* Offline / Demo Mode Toggle */}
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '999px',
                border: isOfflineMode ? '1px solid #818CF8' : '1px solid #E2E8F0',
                backgroundColor: isOfflineMode ? '#EEF2FF' : '#FFFFFF',
                color: isOfflineMode ? '#4F46E5' : '#64748B',
                cursor: 'pointer'
              }}
              title="Toggle between live OpenAI and built-in curriculum engine"
            >
              <Sparkles size={13} />
              <span>{isOfflineMode ? 'Demo Mode Active' : 'Demo Mode'}</span>
            </button>

            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Class {student.grade || '9th'} • {student.level || 'Beginner'}
            </span>
            <button
              onClick={handleClearChat}
              className="btn btn-ghost"
              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#94A3B8' }}
              title="Clear Chat History"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '0'
      }}>
        {/* Messages Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              maxWidth: '420px',
              color: '#94A3B8'
            }}>
              <Bot size={48} color="#C7D2FE" style={{ marginBottom: '12px' }} />
              <h4 style={{ color: '#1E293B', marginBottom: '6px' }}>How can I help you today?</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Ask any question in {activeSubject}, attach your study material, or pick a suggested topic below to get started.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'student';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: '6px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.72rem',
                    color: '#94A3B8'
                  }}>
                    {isUser ? (
                      <>
                        <span>{student.name}</span>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#EC4899',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}>
                          KD
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Bot size={12} />
                        </div>
                        <span style={{ fontWeight: 700, color: '#4F46E5' }}>
                          GuruMitra AI ({msg.subject || activeSubject} • {msg.styleUsed || student.preferredStyle})
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    maxWidth: isUser ? '75%' : '90%',
                    padding: isUser ? '12px 18px' : '20px',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: isUser ? '#4F46E5' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#1E293B',
                    boxShadow: isUser
                      ? '0 4px 14px rgba(79, 70, 229, 0.25)'
                      : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: isUser ? 'none' : '1px solid #E2E8F0',
                    fontSize: '0.92rem',
                    lineHeight: '1.5'
                  }}>
                    {isUser ? (
                      <div>
                        {msg.attachedFile && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            marginBottom: '6px'
                          }}>
                            <FileText size={11} />
                            <span>{msg.attachedFile}</span>
                          </div>
                        )}
                        <div>{msg.text}</div>
                      </div>
                    ) : (
                      /* Rich Structured Response */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Cross-Subject Graceful Notice if query or material was from another domain */}
                        {msg.structuredResponse?.crossSubjectNotice && (
                          <div style={{
                            padding: '10px 14px',
                            backgroundColor: '#FEF3C7',
                            borderRadius: '10px',
                            border: '1px solid #FDE68A',
                            color: '#92400E',
                            fontSize: '0.84rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Lightbulb size={16} color="#D97706" />
                              <span>{msg.structuredResponse.crossSubjectNotice}</span>
                            </div>
                            {(() => {
                              const notice = msg.structuredResponse.crossSubjectNotice || '';
                              const targetSub = subjects.find((s) => notice.includes(s.name));
                              if (targetSub && targetSub.name !== activeSubject) {
                                return (
                                  <button
                                    onClick={() => setActiveSubject(targetSub.name)}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '0.78rem',
                                      backgroundColor: '#7C3AED',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: 700,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span>Switch to {targetSub.name}</span>
                                    <span>→</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}

                        {/* Document Relevant Content Found (for Document Q&A) */}
                        {msg.structuredResponse?.relevantContentFound && (
                          <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#F0FDF4',
                            borderLeft: '4px solid #10B981',
                            borderRadius: '10px',
                            fontSize: '0.86rem',
                            color: '#166534',
                            lineHeight: '1.4'
                          }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                              Relevant Content Extracted From Your Document:
                            </div>
                            <blockquote style={{ margin: 0, fontStyle: 'italic' }}>
                              "{msg.structuredResponse.relevantContentFound}"
                            </blockquote>
                            {msg.structuredResponse.documentReference && (
                              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                                📄 {msg.structuredResponse.documentReference}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Direct Answer */}
                        <div style={{
                          padding: '12px 16px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          borderLeft: '4px solid #4F46E5',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: '#1E293B'
                        }}>
                          💡 {msg.structuredResponse?.directAnswer || msg.text}
                        </div>

                        {/* Interactive Action Box when API Key is not configured */}
                        {msg.structuredResponse?.directAnswer?.includes('AI Tutor API is not configured') && (
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#FEF3C7',
                            borderRadius: '12px',
                            border: '1px solid #FCD34D',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 700, fontSize: '0.92rem' }}>
                              <Key size={17} color="#D97706" />
                              <span>Quick Setup: Choose How You Would Like To Proceed</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: '#78350F', lineHeight: '1.45' }}>
                              Add your OpenAI API key for live AI tutoring across any question, or switch to Demo / Offline Mode to test curriculum topics instantly without an API key.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => setIsConfigModalOpen(true)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 16px',
                                  backgroundColor: '#4F46E5',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.84rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                                }}
                              >
                                <Key size={14} />
                                <span>Configure OpenAI API Key</span>
                              </button>
                              <button
                                onClick={() => {
                                  setIsOfflineMode(true);
                                  const lastUser = [...messages].reverse().find((m) => m.sender === 'student');
                                  if (lastUser && lastUser.text) {
                                    handleSendMessage(lastUser.text, true);
                                  }
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 16px',
                                  backgroundColor: '#FFFFFF',
                                  color: '#4F46E5',
                                  border: '1px solid #C7D2FE',
                                  borderRadius: '8px',
                                  fontSize: '0.84rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <Sparkles size={14} />
                                <span>Switch to Demo Mode & Answer Now</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Core / Simple Explanation */}
                        {msg.structuredResponse?.simpleExplanation && (
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                              {msg.structuredResponse.responseType === 'mathematical' ? 'Mathematical Concept' : 'Explanation'}
                            </div>
                            <p style={{ margin: 0, color: '#334155' }}>
                              {msg.structuredResponse.simpleExplanation}
                            </p>
                          </div>
                        )}

                        {/* Example (for Conceptual Questions) */}
                        {msg.structuredResponse?.example && (
                          <div style={{
                            padding: '10px 14px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.86rem',
                            color: '#334155'
                          }}>
                            <strong style={{ color: '#4F46E5' }}>Example: </strong>
                            {msg.structuredResponse.example}
                          </div>
                        )}

                        {/* Step-by-Step Breakdown (or Math Calculation) */}
                        {msg.structuredResponse?.stepByStep && (
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                              {msg.structuredResponse.responseType === 'mathematical' ? 'Step-by-Step Calculation' : 'Step-by-Step Breakdown'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {msg.structuredResponse.stepByStep.map((step, idx) => (
                                <div key={idx} style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px',
                                  fontSize: '0.88rem',
                                  color: '#334155'
                                }}>
                                  <span style={{ color: '#4F46E5', fontWeight: 700 }}>•</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Real World Analogy */}
                        {msg.structuredResponse?.analogy && (
                          <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#FEF3C7',
                            borderRadius: '12px',
                            border: '1px solid #FDE68A',
                            color: '#92400E',
                            fontSize: '0.88rem'
                          }}>
                            <strong>🧩 Real-World Analogy: </strong>
                            {msg.structuredResponse.analogy}
                          </div>
                        )}

                        {/* Formula or Code block */}
                        {msg.structuredResponse?.formulaOrCode && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                                {msg.structuredResponse.responseType === 'programming' ? 'Python / Code Implementation' : 'Formula & Key Expressions'}
                              </span>
                              <button
                                onClick={() => handleCopy(`code-${msg.id}`, msg.structuredResponse?.formulaOrCode || '')}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#94A3B8',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {copiedId === `code-${msg.id}` ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                                <span>{copiedId === `code-${msg.id}` ? 'Copied' : 'Copy Code'}</span>
                              </button>
                            </div>
                            <div style={{
                              backgroundColor: '#0F172A',
                              color: '#F8FAFC',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              fontFamily: 'monospace',
                              fontSize: '0.82rem',
                              whiteSpace: 'pre-wrap',
                              overflowX: 'auto',
                              border: '1px solid #1E293B'
                            }}>
                              {msg.structuredResponse.formulaOrCode}
                            </div>
                          </div>
                        )}

                        {/* Code Explanation (for Programming) */}
                        {msg.structuredResponse?.codeExplanation && (
                          <div style={{ fontSize: '0.86rem', color: '#334155' }}>
                            <strong style={{ color: '#4F46E5' }}>Code Walkthrough: </strong>
                            {msg.structuredResponse.codeExplanation}
                          </div>
                        )}

                        {/* Complexity Box (for Programming) */}
                        {msg.structuredResponse?.complexity && (
                          <div style={{
                            padding: '10px 14px',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.82rem',
                            color: '#1E293B',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div>
                              <strong style={{ color: '#4F46E5' }}>⏱️ Time Complexity: </strong>
                              {msg.structuredResponse.complexity.time}
                            </div>
                            <div>
                              <strong style={{ color: '#059669' }}>💾 Space Complexity: </strong>
                              {msg.structuredResponse.complexity.space}
                            </div>
                          </div>
                        )}

                        {/* Visual Diagram */}
                        {msg.structuredResponse?.visualDiagram && (
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Structured Visual Representation
                            </div>
                            <div style={{
                              backgroundColor: '#F8FAFC',
                              color: '#1E293B',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              whiteSpace: 'pre-wrap',
                              overflowX: 'auto',
                              border: '1px solid #CBD5E1'
                            }}>
                              {msg.structuredResponse.visualDiagram}
                            </div>
                          </div>
                        )}

                        {/* Key Concept Box */}
                        {msg.structuredResponse?.keyConcept && (
                          <div style={{
                            fontSize: '0.82rem',
                            color: '#059669',
                            backgroundColor: '#ECFDF5',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            border: '1px solid #A7F3D0'
                          }}>
                            🎯 <strong>Key Concept:</strong> {msg.structuredResponse.keyConcept}
                          </div>
                        )}

                        {/* Practice Question */}
                        {msg.structuredResponse?.practiceQuestion && (
                          <div style={{
                            border: '1px solid #E0E7FF',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            backgroundColor: '#F8FAFF'
                          }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', marginBottom: '6px' }}>
                              Quick Check Practice Question
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                              {msg.structuredResponse.practiceQuestion.question}
                            </div>

                            {msg.structuredResponse.practiceQuestion.options && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '10px' }}>
                                {msg.structuredResponse.practiceQuestion.options.map((opt, i) => (
                                  <div key={i} style={{
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '0.8rem',
                                    color: '#475569'
                                  }}>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setShowPracticeAnswer((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }));
                              }}
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                            >
                              <Eye size={12} />
                              <span>{showPracticeAnswer[msg.id] ? 'Hide Solution' : 'Reveal Solution'}</span>
                            </button>

                            {showPracticeAnswer[msg.id] && (
                              <div style={{
                                marginTop: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#DCFCE7',
                                color: '#166534',
                                fontSize: '0.82rem',
                                fontWeight: 600
                              }}>
                                ✓ {msg.structuredResponse.practiceQuestion.answer}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action buttons (Copy) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <button
                            onClick={() => handleCopy(msg.id, msg.structuredResponse?.directAnswer || msg.text)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#94A3B8',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedId === msg.id ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy Answer'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Live Thinking / Synthesis Animation */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={13} />
              </div>
              <div style={{
                padding: '10px 16px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4F46E5', animation: 'pulse-soft 1s infinite' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4F46E5', animation: 'pulse-soft 1s infinite 0.2s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4F46E5', animation: 'pulse-soft 1s infinite 0.4s' }} />
                <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '6px', fontWeight: 600 }}>
                  GuruMitra is thinking with {student.preferredStyle} learning style...
                </span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Dynamic Suggested Follow-up Questions */}
        <div style={{
          padding: '8px 20px',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8' }}>
            SUGGESTED ({activeSubject}):
          </span>
          {activeSuggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '999px',
                padding: '5px 13px',
                fontSize: '0.76rem',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4F46E5';
                e.currentTarget.style.color = '#4F46E5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#475569';
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Uploaded Material Chip above input (Requirement 9) */}
        {uploadedMaterial && (
          <div style={{
            padding: '8px 20px 0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '0.78rem',
              color: '#4338CA',
              fontWeight: 600
            }}>
              <span>📄 {uploadedMaterial.fileName}</span>
              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 800 }}>• Ready</span>
              <button
                onClick={removeUploadedMaterial}
                title="Remove file from current chat context"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#6366F1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: '50%'
                }}
              >
                <X size={13} />
              </button>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              (AI Tutor will use this material as context)
            </span>
          </div>
        )}

        {/* Empty Question Alert */}
        {emptyQueryAlert && (
          <div style={{
            margin: '8px 20px 0',
            padding: '6px 12px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#991B1B',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={14} color="#EF4444" />
            <span>Please enter a question.</span>
          </div>
        )}

        {/* Input Field, Quick Attach & Send Button */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderTop: uploadedMaterial ? 'none' : '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Quick File Attach Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach study material (PDF, DOCX, TXT)"
            className="btn btn-outline"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              borderColor: uploadedMaterial ? '#A5B4FC' : 'var(--border-subtle)',
              color: uploadedMaterial ? '#4F46E5' : '#64748B'
            }}
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => {
              setInputQuery(e.target.value);
              if (emptyQueryAlert) setEmptyQueryAlert(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              uploadedMaterial
                ? `Ask anything about "${uploadedMaterial.fileName}" (e.g. "Summarize this", "What does it say about...")`
                : `Ask any ${activeSubject} question (e.g. "Solve 2x + 5 = 15", "Explain in simple words")...`
            }
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.92rem',
              fontFamily: 'var(--font-family)',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
          />

          <button
            onClick={() => handleSendMessage()}
            className="btn btn-primary"
            style={{ padding: '12px 20px', borderRadius: '12px' }}
            disabled={isTyping}
          >
            <Send size={17} />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* OpenAI Configuration Modal */}
      {isConfigModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4F46E5'
                }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
                    Configure OpenAI API Key
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Powers live, adaptive curriculum tutoring across all subjects
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  OpenAI API Key (sk-...)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-proj-..."
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ display: 'block', fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                  Stored securely in your server's local <code style={{ backgroundColor: '#F1F5F9', padding: '1px 4px', borderRadius: '4px' }}>.env</code> file. Never exposed to browser client code.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Model Selection
                </label>
                <select
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Recommended - Fast & Cost-Effective)</option>
                  <option value="gpt-4o">gpt-4o (Most Intelligent)</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
                </select>
              </div>

              {saveKeyError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '0.84rem'
                }}>
                  {saveKeyError}
                </div>
              )}

              {saveKeySuccess && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  color: '#15803D',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{saveKeySuccess}</span>
                </div>
              )}

              <div style={{
                padding: '10px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#64748B',
                lineHeight: '1.4'
              }}>
                💡 <strong>Don't have an API key right now?</strong> You can close this modal and click <strong>"Demo Mode"</strong> to test questions like "What is photosynthesis?" or "Solve 2x + 5 = 15" using GuruMitra's built-in curriculum engine.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingKey}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isSavingKey ? 'not-allowed' : 'pointer',
                    opacity: isSavingKey ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isSavingKey ? 'Saving...' : 'Save & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
