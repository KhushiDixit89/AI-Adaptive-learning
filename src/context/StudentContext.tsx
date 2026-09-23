import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LearningStyle,
  SubjectType,
  DifficultyLevel,
  BoardType,
  StreamType,
  ClassLevel,
  SubjectData,
  RecommendationItem,
  StudyPlanItem,
  LearningPathNode,
  ActivityItem,
  QuizResult,
  SyllabusFile,
  ParsedMaterial,
  PreAssessmentResult,
  PreAssessmentQuestion,
  StudentProfile as AuthStudentProfile,
  StudyReminder,
  ReminderSettings,
  CurrentLearningContext
} from '../types';
import {
  INITIAL_SUBJECTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_STUDY_PLAN,
  INITIAL_LEARNING_PATH,
  INITIAL_ACTIVITIES,
  mockCurriculum
} from '../data/mockCurriculum';
import {
  getChapters,
  getRecommendations,
  getLearningPath,
  normalizeGrade
} from '../services/curriculumService';
import {
  loadReminderSettings,
  saveReminderSettings,
  recordReminderDismissal,
  recordReminderSnooze,
  generateSmartReminder
} from '../services/reminderService';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { extractTextFromPDF } from '../utils/pdfExtractor';
import { parseSyllabusWithAI, getFallbackSyllabusParse } from '../lib/aiSyllabusParser';
import { processUploadedFile } from '../services/fileProcessingService';

// Extend the AuthStudentProfile with client-specific fields
export interface StudentProfile extends AuthStudentProfile {
  streak: number;
  totalPoints: number;
  rank: number;
  syllabusUploaded: boolean;
  syllabusData?: Record<string, {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    storagePath: string;
    publicUrl: string;
    extractedText: string;
    topics: string[];
    analysisComplete: boolean;
  }>;
}

export interface StudentContextType {
  student: StudentProfile;
  subjects: SubjectData[];
  recommendations: RecommendationItem[];
  studyPlan: StudyPlanItem[];
  learningPath: LearningPathNode[];
  activities: ActivityItem[];
  activeTab: string;
  activeSubject: SubjectType;
  lastQuizResult: QuizResult | null;
  notification: { message: string; type: 'success' | 'info' | 'warning' } | null;
  judgeDemoStep: number;
  syllabusData: Record<string, any>;
  syllabusUploaded: boolean;
  uploadedMaterial: ParsedMaterial | null;
  uploadState: 'idle' | 'uploading' | 'analyzing' | 'ready' | 'error';
  uploadError: string | null;
  currentLearningContext: CurrentLearningContext;
  setCurrentLearningContext: React.Dispatch<React.SetStateAction<CurrentLearningContext>>;
  setActiveTab: (tab: string) => void;
  setActiveSubject: (subject: SubjectType) => void;
  setPreferredStyle: (style: LearningStyle) => void;
  updateProfile: (name: string, grade: string, style: LearningStyle, board?: BoardType, stream?: StreamType) => void;
  toggleStudyPlanItem: (id: string) => void;
  recordQuizResult: (result: QuizResult) => void;
  setJudgeDemoStep: (step: number | ((prev: number) => number)) => void;
  completeSyllabusSetup: (filesRecord: Record<string, any>) => Promise<any>;
  extractAndAnalyzeTopics: (subject: SubjectType, text: string) => Promise<any>;
  setSyllabusAnalysis: (subject: SubjectType, data: any) => void;
  processAndSetFile: (file: File) => Promise<ParsedMaterial>;
  removeUploadedMaterial: () => void;
  clearUploadError: () => void;
  setTopicContext: (
    subject: SubjectType,
    chapter: string,
    topic: string,
    chapterId?: string,
    topicId?: string,
    difficulty?: DifficultyLevel
  ) => void;
  startQuizForCurrentTopic: (override?: Partial<CurrentLearningContext>) => void;
  setAcademicProfile: (
    grade: ClassLevel,
    board: BoardType,
    stream: StreamType,
    style?: LearningStyle,
    level?: DifficultyLevel
  ) => void;
  resetToDefault: () => void;
  clearNotification: () => void;
  preAssessmentResult: PreAssessmentResult | null;
  preAssessmentQuestions: PreAssessmentQuestion[];
  isGeneratingAssessment: boolean;
  setIsGeneratingAssessment: React.Dispatch<React.SetStateAction<boolean>>;
  recordPreAssessmentResult: (result: PreAssessmentResult) => void;
  clearPreAssessment: () => void;
  setPreAssessmentQuestions: React.Dispatch<React.SetStateAction<PreAssessmentQuestion[]>>;
  reminderSettings: ReminderSettings;
  activeReminder: StudyReminder | null;
  updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
  dismissReminder: (id: string) => void;
  snoozeReminder: (id: string, duration: 'later_today' | 'tomorrow') => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Initialize student profile with data from auth user (if available) and defaults for client-specific fields
  const [student, setStudent] = useState<StudentProfile>({
    // Auth fields (from user or defaults)
    id: user ? user.id : 'guest_student',
    name: user ? user.name : 'Khushi Dixit',
    email: user ? user.email : '',
    grade: user ? user.grade : '10th',
    level: user ? user.level : 'Intermediate',
    preferredSubjects: user ? user.preferredSubjects : ['Mathematics', 'Science'],
    preferredStyle: user ? user.preferredStyle : 'Simple',
    isDemo: user ? user.isDemo : false,
    emailVerified: user ? user.emailVerified : true,
    createdAt: user ? (user.createdAt || user.created_at || new Date().toISOString()) : new Date().toISOString(),
    // Client-specific fields with defaults
    streak: 4,
    totalPoints: 1420,
    rank: 76,
    syllabusUploaded: false,
    syllabusData: {}
  });

  const [subjects, setSubjects] = useState<SubjectData[]>(INITIAL_SUBJECTS);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(INITIAL_RECOMMENDATIONS);
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>(INITIAL_STUDY_PLAN);
  const [learningPath, setLearningPath] = useState<LearningPathNode[]>(INITIAL_LEARNING_PATH);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSubject, setActiveSubjectState] = useState<SubjectType>('Mathematics');
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [judgeDemoStep, setJudgeDemoStep] = useState<number>(0);
  const [syllabusData, setSyllabusData] = useState<Record<string, any>>({});

  // Pre-Assessment state
  const [preAssessmentResult, setPreAssessmentResult] = useState<PreAssessmentResult | null>(null);
  const [preAssessmentQuestions, setPreAssessmentQuestions] = useState<PreAssessmentQuestion[]>([]);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState<boolean>(false);

  // Material upload state
  const [uploadedMaterial, setUploadedMaterial] = useState<ParsedMaterial | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'ready' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active learning context
  const [currentLearningContext, setCurrentLearningContext] = useState<CurrentLearningContext>(() => ({
    classLevel: 'Class 9',
    board: 'CBSE',
    stream: 'Not applicable',
    subject: 'Mathematics',
    chapter: 'Number Systems',
    chapterId: 'cbse-9-math-ch1',
    topic: 'Irrational Numbers and Decimal Expansions',
    topicId: 'cbse-9-math-t1',
    learningStyle: 'Simple',
    difficulty: 'Intermediate'
  }));

  const processAndSetFile = async (file: File): Promise<ParsedMaterial> => {
    setUploadState('uploading');
    setUploadError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setUploadState('analyzing');

      const parsed = await processUploadedFile(file);

      await new Promise((resolve) => setTimeout(resolve, 600));

      setUploadedMaterial(parsed);
      setUploadState('ready');

      setNotification({
        message: `Successfully analyzed "${file.name}" (${parsed.wordCount} words, ${parsed.topics.length} topics found). Connected to AI Tutor!`,
        type: 'success'
      });

      return parsed;
    } catch (err: any) {
      setUploadState('error');
      const msg = err?.message || 'Could not read this file. Please try another supported file.';
      setUploadError(msg);
      setNotification({
        message: msg,
        type: 'warning'
      });
      throw err;
    }
  };

  // Smart Study Reminders state & persistence
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(loadReminderSettings);
  const [reminderNonce, setReminderNonce] = useState<number>(0);

  const activeReminder = React.useMemo(() => {
    return generateSmartReminder({
      student,
      currentLearningContext,
      lastQuizResult,
      subjects,
      reminderSettings
    });
  }, [student, currentLearningContext, lastQuizResult, subjects, reminderSettings, reminderNonce]);

  const updateReminderSettings = (newSettings: Partial<ReminderSettings>) => {
    setReminderSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveReminderSettings(updated);
      return updated;
    });
    setNotification({
      message: 'Study reminder settings updated.',
      type: 'success'
    });
  };

  const dismissReminder = (id: string) => {
    recordReminderDismissal(id);
    setReminderNonce((n) => n + 1);
  };

  const snoozeReminder = (id: string, duration: 'later_today' | 'tomorrow') => {
    recordReminderSnooze(id, duration);
    setReminderNonce((n) => n + 1);
    setNotification({
      message: `Reminder snoozed until ${duration === 'later_today' ? 'later today (+3 hrs)' : 'tomorrow'}.`,
      type: 'info'
    });
  };

  // Synchronize student profile whenever auth user changes
  useEffect(() => {
    if (user) {
      const userGrade = normalizeGrade(user.grade);
      setStudent((prev) => ({
        ...prev,
        name: user.name,
        grade: userGrade,
        level: user.level || prev.level,
        preferredStyle: user.preferredStyle || prev.preferredStyle
      }));
      setCurrentLearningContext((prev) => ({
        ...prev,
        classLevel: userGrade,
        learningStyle: user.preferredStyle || prev.learningStyle,
        difficulty: user.level || prev.difficulty
      }));
    }
  }, [user]);

  const removeUploadedMaterial = () => {
    setUploadedMaterial(null);
    setUploadState('idle');
    setUploadError(null);
    setNotification({
      message: 'Uploaded material removed from AI Tutor session.',
      type: 'info'
    });
  };

  const clearUploadError = () => {
    setUploadError(null);
    if (uploadState === 'error') {
      setUploadState('idle');
    }
  };

  const setActiveSubject = (subject: SubjectType) => {
    setActiveSubjectState(subject);
    const updatedRecs = getRecommendations(normalizeGrade(student.grade), student.board || 'CBSE', student.stream || 'Not applicable', subject);
    if (updatedRecs && updatedRecs.length > 0) {
      setRecommendations(updatedRecs);
    }
    const updatedPath = getLearningPath(normalizeGrade(student.grade), student.board || 'CBSE', student.stream || 'Not applicable', subject);
    if (updatedPath && updatedPath.length > 0) {
      setLearningPath(updatedPath);
    }

    const chs = getChapters(normalizeGrade(student.grade), student.board || 'CBSE', student.stream || 'Not applicable', subject);
    const firstCh = chs[0];
    const firstTop = firstCh?.topics[0];
    if (firstCh && firstTop) {
      setCurrentLearningContext((prev) => ({
        ...prev,
        subject,
        chapter: firstCh.title,
        chapterId: firstCh.id,
        topic: firstTop.title,
        topicId: firstTop.id
      }));
    } else {
      setCurrentLearningContext((prev) => ({
        ...prev,
        subject
      }));
    }
  };

  const setTopicContext = (
    subject: SubjectType,
    chapter: string,
    topic: string,
    chapterId?: string,
    topicId?: string,
    difficulty?: DifficultyLevel
  ) => {
    setActiveSubjectState(subject);
    setCurrentLearningContext((prev) => ({
      ...prev,
      subject,
      chapter,
      topic,
      chapterId: chapterId || prev.chapterId,
      topicId: topicId || prev.topicId,
      difficulty: difficulty || prev.difficulty
    }));
  };

  const startQuizForCurrentTopic = (override?: Partial<CurrentLearningContext>) => {
    if (override) {
      setCurrentLearningContext((prev) => ({ ...prev, ...override }));
      if (override.subject) {
        setActiveSubjectState(override.subject);
      }
    }
    setActiveTab('quiz');
  };

  const setAcademicProfile = (
    grade: ClassLevel,
    board: BoardType,
    stream: StreamType,
    style?: LearningStyle,
    level?: DifficultyLevel
  ) => {
    setStudent(prev => ({
      ...prev,
      grade,
      board,
      stream,
      preferredStyle: style || prev.preferredStyle,
      level: level || prev.level
    }));
    if (style) {
      setPreferredStyle(style);
    }
  };

  // Topic extraction helper (client-side matching against curriculum)
  const extractAndAnalyzeTopics = async (subject: SubjectType, text: string): Promise<any> => {
    try {
      const curriculum = mockCurriculum[subject];
      if (!curriculum || !curriculum.topics) return [];

      const textLower = text.toLowerCase();
      const detected = curriculum.topics.filter(topic =>
        textLower.includes(topic.toLowerCase())
      );
      return detected.length > 0 ? detected : curriculum.topics.slice(0, 6);
    } catch (error) {
      console.error('Error in topic extraction:', error);
      return [];
    }
  };

  // Helper to update analysis for a subject
  const setSyllabusAnalysis = (subject: SubjectType, analysisData: any) => {
    setStudent(prev => ({
      ...prev,
      syllabusData: {
        ...(prev.syllabusData || {}),
        [subject]: {
          ...(prev.syllabusData?.[subject] || {}),
          ...analysisData
        }
      }
    }));
  };

  // Enhanced syllabus setup with Supabase storage and fallback
  const completeSyllabusSetup = async (filesRecord: Record<string, any>) => {
    try {
      const currentUserId = user?.id || 'guest_student';

      const uploadPromises = Object.entries(filesRecord).map(async ([subjectKey, fileData]) => {
        if (!fileData) return null;

        let storagePath = '';
        let publicUrl = '';
        let extractedText = `Syllabus for ${subjectKey}. Covered units: ${mockCurriculum[subjectKey as SubjectType]?.topics?.join(', ')}`;

        // Attempt Supabase Storage Upload if file object is present and supabase is configured
        if (fileData.file && supabase) {
          try {
            const fileName = `${currentUserId}/${subjectKey}/${Date.now()}-${fileData.name}`;
            const { data: uploadData, error: uploadError } = await supabase
              .storage
              .from('syllabus-uploads')
              .upload(fileName, fileData.file, {
                contentType: fileData.type || 'application/pdf',
                upsert: true
              });

            if (!uploadError && uploadData) {
              storagePath = fileName;
              const { data: urlData } = supabase
                .storage
                .from('syllabus-uploads')
                .getPublicUrl(fileName);
              publicUrl = urlData?.publicUrl || '';

              // Try Supabase Function for extraction if available
              try {
                const { data: extractionData } = await supabase.functions.invoke(
                  'extract-pdf-text',
                  { body: { filePath: fileName } }
                );
                if (extractionData?.text) {
                  extractedText = extractionData.text;
                }
              } catch (funcErr) {
                console.warn('PDF text extraction edge function skipped, using fallback parsing:', funcErr);
              }
            }
          } catch (storageErr) {
            console.warn('Supabase storage upload skipped or failed, using local in-memory fallback:', storageErr);
          }
        }

        // Extract actual text and generate AI-powered syllabus analysis if we have the file
        if (fileData.file) {
          try {
            // Extract raw text from PDF
            const { rawText } = await extractTextFromPDF(fileData.file);
            extractedText = rawText;

            // Use AI-powered syllabus parser to extract chapters and generate exam-focused topics
            const parsedSyllabus = parseSyllabusWithAI(rawText, subjectKey as SubjectType);

            return {
              subject: subjectKey,
              fileName: fileData.name,
              fileSize: fileData.size,
              uploadedAt: fileData.uploadedAt || new Date().toISOString(),
              storagePath,
              publicUrl,
              extractedText: parsedSyllabus.rawText,
              topics: parsedSyllabus.chapters, // Chapters as topics for backward compatibility
              analysisComplete: true
            };
          } catch (pdfErr) {
            console.warn('Client-side PDF extraction failed, using fallback:', pdfErr);
          }
        }

        // Fallback: Use AI-powered fallback syllabus parser (FREE - zero API cost)
        const fallbackSyllabus = getFallbackSyllabusParse(subjectKey as SubjectType);

        return {
          subject: subjectKey,
          fileName: fileData.name,
          fileSize: fileData.size,
          uploadedAt: fileData.uploadedAt || new Date().toISOString(),
          storagePath,
          publicUrl,
          extractedText: fallbackSyllabus.rawText,
          topics: fallbackSyllabus.chapters,
          analysisComplete: true
        };
      });

      const results = await Promise.all(uploadPromises);
      const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);
      const syllabusMap = Object.fromEntries(validResults.map(r => [r.subject, r]));

      // Update state
      setStudent(prev => ({
        ...prev,
        syllabusData: syllabusMap,
        syllabusUploaded: true
      }));
      setSyllabusData(syllabusMap);

      // Save to per-user localStorage key
      if (user?.id) {
        const userSyllabusKey = `gurumitra_syllabus_data_${user.id}`;
        localStorage.setItem(userSyllabusKey, JSON.stringify(syllabusMap));
      }

      setNotification({
        message: 'Syllabus uploaded and analyzed successfully with AI!',
        type: 'success'
      });

      return validResults;
    } catch (error) {
      console.error('Syllabus setup failed:', error);
      throw error;
    }
  };

  // Synchronize student profile whenever auth user changes (e.g. login, signup, demo)
  useEffect(() => {
    if (user) {
      setStudent((prev) => ({
        ...prev,
        // Update auth-dependent fields
        id: user.id,
        name: user.name,
        email: user.email,
        grade: user.grade || '10th',
        level: user.level || 'Intermediate',
        preferredSubjects: user.preferredSubjects,
        preferredStyle: user.preferredStyle,
        isDemo: user.isDemo,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt || user.created_at || new Date().toISOString()
      }));

      // If user selected preferred subjects, set active subject to first one if available
      if (user.preferredSubjects && user.preferredSubjects.length > 0) {
        setActiveSubjectState(user.preferredSubjects[0]);
      }

      // Restore syllabus data from localStorage using per-user key
      const userSyllabusKey = `gurumitra_syllabus_data_${user.id}`;
      try {
        const savedSyllabusData = localStorage.getItem(userSyllabusKey);
        if (savedSyllabusData) {
          const parsedData = JSON.parse(savedSyllabusData);
          setSyllabusData(parsedData);
          setStudent((prev) => ({ ...prev, syllabusData: parsedData, syllabusUploaded: true }));
        } else {
          // No syllabus for this user — reset to fresh state
          setSyllabusData({});
          setStudent((prev) => ({ ...prev, syllabusData: {}, syllabusUploaded: false }));
        }
      } catch (err) {
        console.error('Failed to restore syllabus data:', err);
        setSyllabusData({});
        setStudent((prev) => ({ ...prev, syllabusData: {}, syllabusUploaded: false }));
      }

      // Restore pre-assessment result from localStorage
      const userAssessKey = `gurumitra_pre_assessment_${user.id}`;
      try {
        const savedAssess = localStorage.getItem(userAssessKey);
        if (savedAssess) {
          setPreAssessmentResult(JSON.parse(savedAssess));
        } else {
          setPreAssessmentResult(null);
        }
      } catch {
        setPreAssessmentResult(null);
      }
    } else {
      // User logged out — reset syllabus and assessment state completely
      setSyllabusData({});
      setStudent((prev) => ({ ...prev, syllabusData: {}, syllabusUploaded: false }));
      setPreAssessmentResult(null);
    }
  }, [user]);

  const recordPreAssessmentResult = (result: PreAssessmentResult) => {
    setPreAssessmentResult(result);
    const userId = user?.id || 'guest_student';
    try {
      localStorage.setItem(`gurumitra_pre_assessment_${userId}`, JSON.stringify(result));
    } catch (e) {
      console.warn('Could not persist pre-assessment to localStorage:', e);
    }

    // Update student diagnostic baseline level
    const newLevel: DifficultyLevel = result.overallScore <= 50 ? 'Beginner' : result.overallScore <= 75 ? 'Intermediate' : 'Advanced';
    setStudent(prev => ({
      ...prev,
      level: newLevel,
      overallAccuracy: result.knowledgeScore
    }));

    // Seamlessly adapt Recommendations based on identified diagnostic gaps
    if (result.identifiedGaps.length > 0) {
      const adaptedRecs: RecommendationItem[] = result.identifiedGaps.slice(0, 4).map((gap, i) => ({
        id: `rec_diag_${gap.id}_${i}`,
        topic: gap.topic,
        subject: gap.subject,
        difficulty: gap.priority === 'High Priority' ? 'Beginner' : 'Intermediate',
        reason: gap.prerequisite
          ? `Diagnostic Gap: Master ${gap.prerequisite} before returning to ${gap.chapterName}.`
          : `Diagnostic Gap (${gap.accuracy}% accuracy in pre-assessment).`,
        duration: '15 mins',
        priority: gap.priority === 'High Priority' ? 'High Priority' : 'Practice',
        completed: false
      }));
      setRecommendations(prev => [...adaptedRecs, ...prev.filter(p => !p.id.startsWith('rec_diag_'))]);
    }

    // Add activity record
    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      type: 'adaptation',
      title: 'Diagnostic Pre-Assessment Completed',
      subtitle: `Scored ${result.overallScore}% (${result.learningLevel}) across ${result.totalQuestions} questions.`,
      time: 'Just now',
      tag: 'Pre-Assessment',
      badgeType: 'High Priority'
    };
    setActivities(prev => [newActivity, ...prev]);

    setNotification({
      message: `Diagnostic pre-assessment complete! Scored ${result.overallScore}%. Adaptive learning path updated.`,
      type: 'success'
    });
  };

  const clearPreAssessment = () => {
    setPreAssessmentResult(null);
    const userId = user?.id || 'guest_student';
    try {
      localStorage.removeItem(`gurumitra_pre_assessment_${userId}`);
    } catch {}
  };

  const clearNotification = () => setNotification(null);

  const setPreferredStyle = (style: LearningStyle) => {
    setStudent((prev) => ({ ...prev, preferredStyle: style }));
    setNotification({
      message: `Preferred learning style updated to "${style}". AI content adapted!`,
      type: 'info'
    });
  };

  const updateProfile = (name: string, grade: string, style: LearningStyle, board?: BoardType, stream?: StreamType) => {
    setStudent((prev) => ({
      ...prev,
      name,
      grade,
      preferredStyle: style,
      board: board || prev.board,
      stream: stream || prev.stream
    }));
    setNotification({
      message: 'Student profile updated successfully!',
      type: 'success'
    });
  };

  const toggleStudyPlanItem = (id: string) => {
    setStudyPlan((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // CORE USP: DYNAMIC ADAPTATION ENGINE
  const recordQuizResult = (result: QuizResult) => {
    setLastQuizResult(result);

    const { accuracy, score, totalQuestions, subject, topic } = result;

    let newLevel: DifficultyLevel = student.level;
    let adaptationMsg = '';
    let notificationType: 'success' | 'info' | 'warning' = 'info';

    if (accuracy > 80) {
      newLevel = 'Advanced';
      adaptationMsg = 'Great performance! Difficulty increased to Advanced. Unlocked advanced challenges!';
      notificationType = 'success';
    } else if (accuracy >= 60) {
      newLevel = 'Intermediate';
      adaptationMsg = "You're progressing steadily. Continue at Intermediate level.";
      notificationType = 'info';
    } else {
      newLevel = 'Beginner';
      adaptationMsg = "Let's strengthen the basics before moving ahead. Difficulty adjusted to Beginner (Revision).";
      notificationType = 'warning';
    }

    // 1. Update Student Profile
    const xpGained = accuracy >= 80 ? 150 : accuracy >= 60 ? 80 : 40;
    setStudent((prev) => {
      const currentAcc = prev.overallAccuracy ?? 80;
      const currentProg = prev.overallProgress ?? 70;
      const currentXp = prev.xp ?? 1000;
      const currentLessons = prev.completedLessons ?? 10;
      const newAcc = Math.round((currentAcc * 4 + accuracy) / 5);
      const newProg = Math.min(100, currentProg + 2);
      return {
        ...prev,
        level: newLevel,
        overallAccuracy: newAcc,
        overallProgress: newProg,
        xp: currentXp + xpGained,
        completedLessons: currentLessons + 1
      };
    });

    // 2. Update Subject Matrix
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.name === subject) {
          const updatedStrengths = [...sub.strengths];
          const updatedWeaknesses = [...sub.weaknesses];

          if (accuracy >= 80) {
            if (!updatedStrengths.includes(topic)) updatedStrengths.push(topic);
            const idx = updatedWeaknesses.indexOf(topic);
            if (idx > -1) updatedWeaknesses.splice(idx, 1);
          } else if (accuracy < 60) {
            if (!updatedWeaknesses.includes(topic)) updatedWeaknesses.push(topic);
            const idx = updatedStrengths.indexOf(topic);
            if (idx > -1) updatedStrengths.splice(idx, 1);
          }

          return {
            ...sub,
            accuracy: Math.round((sub.accuracy + accuracy) / 2),
            level: newLevel,
            completedTopics: Math.min(sub.totalTopics, sub.completedTopics + 1),
            strengths: updatedStrengths,
            weaknesses: updatedWeaknesses
          };
        }
        return sub;
      })
    );

    // 3. Update Recommendations Queue Dynamically
    if (accuracy < 60) {
      const remedialRec: RecommendationItem = {
        id: `rec-${Date.now()}`,
        topic: `${topic} Basics`,
        subject: subject,
        difficulty: 'Beginner',
        reason: `Recommended because your recent accuracy in ${topic} was ${accuracy}%.`,
        duration: '15 min',
        priority: 'High Priority'
      };
      setRecommendations((prev) => [remedialRec, ...prev.slice(0, 4)]);

      // Add high priority study plan item
      const newPlanItem: StudyPlanItem = {
        id: `plan-${Date.now()}`,
        title: `Revise ${topic} Basics`,
        duration: '15 min',
        type: 'High Priority',
        subject: subject,
        completed: false
      };
      setStudyPlan((prev) => [newPlanItem, ...prev.slice(0, 3)]);

      // Update Learning Path to insert remedial revision
      setLearningPath((prev) =>
        prev.map((node) => {
          if (node.title.toLowerCase().includes(topic.toLowerCase()) || node.id === 'path-4') {
            return {
              ...node,
              status: 'revision',
              description: `AI flagged this node for remedial reinforcement (${accuracy}% accuracy).`
            };
          }
          return node;
        })
      );
    } else if (accuracy >= 80) {
      const advancedRec: RecommendationItem = {
        id: `rec-${Date.now()}`,
        topic: `Advanced ${topic} & Applications`,
        subject: subject,
        difficulty: 'Advanced',
        reason: `High mastery demonstrated (${accuracy}%). Advancing to deep-dive applications!`,
        duration: '20 min',
        priority: 'On Track'
      };
      setRecommendations((prev) => [advancedRec, ...prev.slice(0, 4)]);

      // Unlock next node in Learning Path
      setLearningPath((prev) =>
        prev.map((node, index) => {
          if (node.status === 'locked' && index <= 4) {
            return { ...node, status: 'current', description: 'Unlocked based on high performance!' };
          }
          return node;
        })
      );
    }

    // 3.5. Evaluate Timed Quiz / Exam Challenge Intelligence
    if (result.timedQuizAnalytics) {
      const { averageResponseTime, speedCategory, performanceInsight, recommendedNextStep } =
        result.timedQuizAnalytics;

      if (accuracy >= 80 && speedCategory === 'slow') {
        const speedRec: RecommendationItem = {
          id: `rec-speed-${Date.now()}`,
          topic: `Rapid Recall: ${topic}`,
          subject: subject,
          difficulty: newLevel,
          reason: `Accuracy is strong (${accuracy}%), but response speed (${averageResponseTime}s/q) indicates speed practice will help in exams.`,
          duration: '10 min',
          priority: 'Practice'
        };
        setRecommendations((prev) => [speedRec, ...prev.slice(0, 4)]);
      } else if (accuracy < 60 && speedCategory === 'fast') {
        const reasoningRec: RecommendationItem = {
          id: `rec-reasoning-${Date.now()}`,
          topic: `${topic} Conceptual Reasoning`,
          subject: subject,
          difficulty: 'Beginner',
          reason: `Fast response speed detected (${averageResponseTime}s/q), but accuracy was ${accuracy}%. Review key reasoning steps before attempting timed sets.`,
          duration: '15 min',
          priority: 'High Priority'
        };
        setRecommendations((prev) => [reasoningRec, ...prev.slice(0, 4)]);
      }

      // Re-trigger smart reminder to reflect new quiz insights
      setReminderNonce((n) => n + 1);
    }

    // 4. Add Activity Log
    const timeSubtitle = result.timedQuizAnalytics
      ? ` • Time: ${Math.floor(result.timedQuizAnalytics.totalTimeUsed / 60)}m ${result.timedQuizAnalytics.totalTimeUsed % 60}s (${result.timedQuizAnalytics.averageResponseTime}s/q)`
      : '';

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'quiz',
      title: `${result.isExamMode ? '⏱️ Exam Challenge' : 'Quiz'} completed: ${topic}`,
      subtitle: `${subject} • Score: ${score}/${totalQuestions} (${accuracy}%)${timeSubtitle}`,
      time: 'Just now',
      tag: result.timedQuizAnalytics ? `${result.timedQuizAnalytics.speedCategory.toUpperCase()} • ${accuracy}%` : `Accuracy: ${accuracy}%`,
      badgeType: accuracy >= 80 ? 'On Track' : accuracy >= 60 ? 'Practice' : 'High Priority'
    };

    const adaptationActivity: ActivityItem = {
      id: `act-adapt-${Date.now()}`,
      type: 'adaptation',
      title: 'AI Engine Adapted Curriculum',
      subtitle: adaptationMsg,
      time: 'Just now',
      tag: newLevel,
      badgeType: accuracy >= 80 ? 'On Track' : accuracy >= 60 ? 'Practice' : 'High Priority'
    };

    setActivities((prev) => [newActivity, adaptationActivity, ...prev.slice(0, 4)]);

    // 5. Trigger System Notification
    setNotification({
      message: `Quiz Submitted: ${score}/${totalQuestions} (${accuracy}%). ${adaptationMsg}`,
      type: notificationType
    });
  };

  const resetToDefault = () => {
    setStudent({
      // Auth fields (from user or defaults)
      id: user ? user.id : 'guest_student',
      name: user ? user.name : 'Khushi Dixit',
      email: user ? user.email : '',
      grade: user ? user.grade : '10th',
      level: user ? user.level : 'Intermediate',
      preferredSubjects: user ? user.preferredSubjects : ['Mathematics', 'Science'],
      preferredStyle: user ? user.preferredStyle : 'Simple',
      isDemo: user ? user.isDemo : false,
      emailVerified: user ? user.emailVerified : true,
      createdAt: user ? (user.createdAt || user.created_at || new Date().toISOString()) : new Date().toISOString(),
      // Client-specific fields with defaults
      streak: 4,
      totalPoints: 1420,
      rank: 76,
      syllabusUploaded: false,
      syllabusData: {}
    });
    setSubjects(INITIAL_SUBJECTS);
    setRecommendations(INITIAL_RECOMMENDATIONS);
    setStudyPlan(INITIAL_STUDY_PLAN);
    setLearningPath(INITIAL_LEARNING_PATH);
    setActivities(INITIAL_ACTIVITIES);
    setLastQuizResult(null);
    setJudgeDemoStep(0);
    setUploadedMaterial(null);
    setUploadState('idle');
    setUploadError(null);
    setNotification({
      message: 'Demo state reset to initial baseline successfully!',
      type: 'info'
    });
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        subjects,
        recommendations,
        studyPlan,
        learningPath,
        activities,
        activeTab,
        activeSubject,
        lastQuizResult,
        notification,
        judgeDemoStep,
        syllabusData,
        syllabusUploaded: student.syllabusUploaded,
        uploadedMaterial,
        uploadState,
        uploadError,
        currentLearningContext,
        setCurrentLearningContext,
        setActiveTab,
        setActiveSubject,
        setPreferredStyle,
        updateProfile,
        toggleStudyPlanItem,
        recordQuizResult,
        setJudgeDemoStep,
        completeSyllabusSetup,
        extractAndAnalyzeTopics,
        setSyllabusAnalysis,
        processAndSetFile,
        removeUploadedMaterial,
        clearUploadError,
        setTopicContext,
        startQuizForCurrentTopic,
        setAcademicProfile,
        resetToDefault,
        clearNotification,
        preAssessmentResult,
        preAssessmentQuestions,
        isGeneratingAssessment,
        setIsGeneratingAssessment,
        recordPreAssessmentResult,
        clearPreAssessment,
        setPreAssessmentQuestions,
        reminderSettings,
        activeReminder,
        updateReminderSettings,
        dismissReminder,
        snoozeReminder
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};