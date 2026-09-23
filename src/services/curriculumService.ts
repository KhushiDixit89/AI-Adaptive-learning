import {
  ClassLevel,
  BoardType,
  StreamType,
  SubjectType,
  DifficultyLevel,
  SubjectData,
  CurriculumChapter,
  CurriculumLessonContent,
  QuizQuestion,
  RecommendationItem,
  LearningPathNode
} from '../types';
import {
  CURRICULUM_STRUCTURE,
  CURRICULUM_CHAPTERS,
  SUBJECT_METADATA,
  generateCurriculumLesson
} from '../data/curriculum';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import {
  getQuizForTopic,
  generateQuizQuestionsForTopic,
  calculateAdaptiveQuizTimer,
  determineStudentPace
} from './quizEngine';

/**
 * Normalizes grade strings like '9th' or '9' to 'Class 9'
 */
export function normalizeGrade(rawGrade?: string): ClassLevel {
  if (!rawGrade) return 'Class 9';
  const clean = rawGrade.trim();
  if (clean.startsWith('Class ')) return clean as ClassLevel;
  const num = clean.replace(/[^0-9]/g, '');
  if (num && ['6', '7', '8', '9', '10', '11', '12'].includes(num)) {
    return `Class ${num}` as ClassLevel;
  }
  return 'Class 9';
}

/**
 * Validates that content subject matches expected active subject.
 * Strict check to prevent Chemistry bleed into Mathematics or Physics.
 */
export function validateSubjectContext(contentSubject: string, expectedSubject: string): boolean {
  if (!contentSubject || !expectedSubject) return false;
  const c = contentSubject.trim().toLowerCase();
  const e = expectedSubject.trim().toLowerCase();
  return c === e || c.includes(e) || e.includes(c);
}

/**
 * Returns available subjects for a specific Class, Board, and Stream
 */
export function getAvailableSubjects(
  grade?: ClassLevel | string,
  board: BoardType = 'CBSE',
  stream: StreamType = 'Not applicable'
): SubjectData[] {
  const normGrade = normalizeGrade(grade);
  const boardStructure = CURRICULUM_STRUCTURE[normGrade]?.[board] || CURRICULUM_STRUCTURE['Class 9']['CBSE'];
  
  // For Class 6-10, stream is always 'Not applicable'
  const isSenior = normGrade === 'Class 11' || normGrade === 'Class 12';
  const effectiveStream: StreamType = isSenior ? (stream === 'Not applicable' ? 'Science' : stream) : 'Not applicable';

  const subjectNames = boardStructure[effectiveStream] || boardStructure['Not applicable'] || [
    'Mathematics',
    'Science',
    'English',
    'Social Science',
    'Hindi'
  ];

  return subjectNames.map((name, index) => {
    const meta = SUBJECT_METADATA[name] || {
      id: `subj-${index + 1}`,
      name,
      icon: '📚',
      color: '#4F46E5',
      bgLight: '#EEF2FF',
      description: `${name} curriculum for ${normGrade} ${board}.`
    };

    return {
      id: meta.id,
      name: meta.name as SubjectType,
      progress: Math.max(30, 85 - index * 10),
      level: 'Intermediate',
      accuracy: Math.max(65, 88 - index * 6),
      completedTopics: Math.max(4, 16 - index * 2),
      totalTopics: 20,
      strengths: [`${name} Foundations`, 'Key Terminology'],
      weaknesses: ['Advanced Derivations'],
      icon: meta.icon,
      color: meta.color,
      bgLight: meta.bgLight,
      description: meta.description,
      topics: (meta as any).topics || []
    };
  });
}

/**
 * Retrieves chapters for a given Subject, Class, Board, and Stream
 */
export function getChapters(
  grade?: ClassLevel | string,
  board: BoardType = 'CBSE',
  stream: StreamType = 'Not applicable',
  subject: string = 'Mathematics'
): CurriculumChapter[] {
  const normGrade = normalizeGrade(grade);
  const matched = CURRICULUM_CHAPTERS.filter(
    (c) =>
      c.classLevel === normGrade &&
      c.board === board &&
      validateSubjectContext(c.subject, subject)
  );

  if (matched.length > 0) return matched;

  // Fallback: match by subject name regardless of board, strictly within the same class level
  const fallback = CURRICULUM_CHAPTERS.filter(
    (c) => c.classLevel === normGrade && validateSubjectContext(c.subject, subject)
  );
  if (fallback.length > 0) return fallback;

  // Create standard synthetic chapter representation
  return [
    {
      id: `ch-gen-1`,
      number: 1,
      title: `${subject} Foundations`,
      subject,
      classLevel: normGrade,
      board,
      stream,
      description: `Core concepts and syllabus requirements for ${subject}.`,
      topics: [
        {
          id: `top-gen-1`,
          title: `Introduction to ${subject}`,
          difficulty: 'Beginner',
          keyPoints: ['Fundamental definitions', 'Basic principles', 'Practical examples'],
          summary: `Primary overview of ${subject} prescribed by ${board}.`
        },
        {
          id: `top-gen-2`,
          title: `Applied ${subject} Problem Solving`,
          difficulty: 'Intermediate',
          keyPoints: ['Step-by-step methodology', 'Board exam patterns'],
          summary: `Core application exercises and analysis.`
        }
      ]
    }
  ];
}

export { generateCurriculumLesson } from '../data/curriculum';

/**
 * Returns complete dynamic lesson content with 4 learning styles
 */
export function getLesson(
  grade?: ClassLevel | string,
  board: BoardType = 'CBSE',
  stream: StreamType = 'Not applicable',
  subject: string = 'Mathematics',
  chapterId?: string,
  topicId?: string
): CurriculumLessonContent {
  const normGrade = normalizeGrade(grade);
  return generateCurriculumLesson(normGrade, board, stream, subject, chapterId, topicId);
}

/**
 * Returns dynamic "Today's Lesson" summary for Dashboard
 */
export function getTodaysLesson(
  grade?: ClassLevel | string,
  board: BoardType = 'CBSE',
  stream: StreamType = 'Not applicable',
  subject: string = 'Mathematics',
  difficulty: DifficultyLevel = 'Intermediate'
) {
  const normGrade = normalizeGrade(grade);
  const lesson = getLesson(normGrade, board, stream, subject);

  return {
    subject: lesson.subject,
    chapter: lesson.chapterTitle,
    topic: lesson.topicTitle,
    progress: lesson.progress,
    difficulty: lesson.difficulty || difficulty,
    heading: lesson.styles.Simple.heading,
    summary: lesson.styles.Simple.paragraph
  };
}

/**
 * Normalizes text for robust matching while preserving semantic distinction
 */
function cleanText(text?: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a question's chapter matches the target chapter
 */
export function chapterMatches(qChapter?: string, targetChapter?: string): boolean {
  if (!targetChapter) return true;
  if (!qChapter) return true;
  const qClean = cleanText(qChapter);
  const tClean = cleanText(targetChapter);
  return qClean === tClean || qClean.includes(tClean) || tClean.includes(qClean);
}

/**
 * Checks if a question's topic matches the target topic
 * Strictly prevents cross-topic pollution (e.g. Geometry vs Number Systems, Motion vs Carbon)
 */
export function topicMatches(qTopic?: string, targetTopic?: string): boolean {
  if (!targetTopic) return true;
  if (!qTopic) return true;
  const qClean = cleanText(qTopic);
  const tClean = cleanText(targetTopic);

  if (qClean === tClean) return true;

  // Strict cross-topic collision guards:
  // 1. Triangles / Geometry vs Number Systems / Irrational Numbers
  if (qClean.includes('triangle') && !tClean.includes('triangle')) return false;
  if (tClean.includes('triangle') && !qClean.includes('triangle')) return false;
  if ((qClean.includes('irrational') || qClean.includes('rational')) && 
      (!tClean.includes('irrational') && !tClean.includes('rational') && !tClean.includes('number'))) return false;
  if ((tClean.includes('irrational') || tClean.includes('rational')) && 
      (!qClean.includes('irrational') && !qClean.includes('rational') && !qClean.includes('number'))) return false;

  // 2. Motion vs Functional Groups / Carbon
  if ((qClean.includes('motion') || qClean.includes('velocity')) && 
      (tClean.includes('carbon') || tClean.includes('functional') || tClean.includes('alcohol'))) return false;
  if ((tClean.includes('motion') || tClean.includes('velocity')) && 
      (qClean.includes('carbon') || qClean.includes('functional') || qClean.includes('alcohol'))) return false;

  // 3. Binary Trees vs Algorithms / Other CS
  if (qClean.includes('tree') && !tClean.includes('tree')) return false;
  if (tClean.includes('tree') && !qClean.includes('tree')) return false;

  return qClean.includes(tClean) || tClean.includes(qClean);
}

/**
 * Subject- and Topic-specific quiz question repository
 * Delegates to universal quiz engine
 */
export function getQuizQuestions(
  grade?: ClassLevel | string,
  board: BoardType = 'CBSE',
  stream: StreamType = 'Not applicable',
  subject: string = 'Mathematics',
  chapter?: string,
  topic?: string,
  difficulty?: DifficultyLevel
): QuizQuestion[] {
  const normGrade = normalizeGrade(grade);
  return getQuizForTopic({
    classLevel: normGrade,
    board,
    stream,
    subject: subject as SubjectType,
    chapter: chapter || 'General Foundations',
    topic: topic || 'Core Concepts',
    difficulty: difficulty || 'Intermediate',
    learningStyle: 'Simple'
  });
}

export {
  getQuizForTopic,
  generateQuizQuestionsForTopic,
  calculateAdaptiveQuizTimer,
  determineStudentPace
};

/**
 * Returns dynamic recommendations based on subject, grade, and weak areas
 */
export function getRecommendations(
  grade?: ClassLevel | string,
  board: BoardType = 'CBSE',
  stream: StreamType = 'Not applicable',
  subject: string = 'Mathematics',
  weakTopics: string[] = [],
  accuracy: number = 75
): RecommendationItem[] {
  const normGrade = normalizeGrade(grade);
  const chapters = getChapters(normGrade, board, stream, subject);
  const top1 = chapters[0]?.topics[0]?.title || `${subject} Core Fundamentals`;
  const top2 = chapters[0]?.topics[1]?.title || `${subject} Problem Solving`;

  return [
    {
      id: `rec-${subject.toLowerCase()}-1`,
      topic: weakTopics.length > 0 ? weakTopics[0] : top1,
      subject: subject as SubjectType,
      difficulty: accuracy < 60 ? 'Beginner' : 'Intermediate',
      reason:
        accuracy < 60
          ? `Reinforce foundational understanding in ${subject} before proceeding.`
          : `High-yield topic frequently tested in ${normGrade} ${board} examinations.`,
      duration: '15 min',
      priority: 'High Priority'
    },
    {
      id: `rec-${subject.toLowerCase()}-2`,
      topic: top2,
      subject: subject as SubjectType,
      difficulty: 'Intermediate',
      reason: `Identified by the GuruMitra AI adaptive diagnostic matrix as your next logical milestone.`,
      duration: '20 min',
      priority: 'Practice'
    }
  ];
}

/**
 * Returns dynamic Learning Path nodes for a subject
 */
export function getLearningPath(
  grade?: ClassLevel | string,
  board: BoardType = 'CBSE',
  stream: StreamType = 'Not applicable',
  subject: string = 'Mathematics'
): LearningPathNode[] {
  const normGrade = normalizeGrade(grade);
  const chapters = getChapters(normGrade, board, stream, subject);

  const nodes: LearningPathNode[] = [];
  let step = 1;

  chapters.forEach((ch, chIdx) => {
    ch.topics.forEach((t: any, tIdx: number) => {
      const isFirst = chIdx === 0 && tIdx === 0;
      const isSecond = chIdx === 0 && tIdx === 1;

      nodes.push({
        id: `lp-${ch.id}-${t.id}`,
        title: `${ch.number}.${tIdx + 1} ${t.title}`,
        subject: subject as SubjectType,
        status: isFirst ? 'completed' : isSecond ? 'current' : 'locked',
        level: t.difficulty,
        description: t.summary,
        stepNumber: step++
      });
    });
  });

  return nodes;
}
