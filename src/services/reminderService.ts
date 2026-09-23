import {
  StudentProfile,
  CurrentLearningContext,
  QuizResult,
  SubjectData,
  StudyReminder,
  ReminderSettings,
  ReminderType
} from '../types';

export const REMINDER_SETTINGS_STORAGE_KEY = 'gurumitra_reminder_settings';
export const REMINDER_STATE_STORAGE_KEY = 'gurumitra_reminder_state';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  preferredTime: '18:00',
  frequency: 'daily',
  remindUnfinishedLessons: true,
  remindPendingQuizzes: true,
  remindWeakTopics: true
};

export function loadReminderSettings(): ReminderSettings {
  try {
    const saved = localStorage.getItem(REMINDER_SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    // Ignore storage read error
  }
  return DEFAULT_REMINDER_SETTINGS;
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(REMINDER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // Ignore storage write error
  }
}

interface StoredReminderState {
  dismissedIds: Record<string, number>; // id -> timestamp
  snoozedUntil: Record<string, number>; // id -> timestamp
}

export function loadReminderState(): StoredReminderState {
  try {
    const saved = localStorage.getItem(REMINDER_STATE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Ignore storage read error
  }
  return { dismissedIds: {}, snoozedUntil: {} };
}

export function recordReminderDismissal(id: string): void {
  try {
    const state = loadReminderState();
    state.dismissedIds[id] = Date.now();
    localStorage.setItem(REMINDER_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

export function recordReminderSnooze(id: string, duration: 'later_today' | 'tomorrow'): void {
  try {
    const state = loadReminderState();
    const hours = duration === 'later_today' ? 3 : 24;
    state.snoozedUntil[id] = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem(REMINDER_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

export function isReminderActive(id: string): boolean {
  const state = loadReminderState();
  const now = Date.now();

  // If dismissed in the last 6 hours, treat as inactive
  if (state.dismissedIds[id] && now - state.dismissedIds[id] < 6 * 60 * 60 * 1000) {
    return false;
  }

  // If snoozed and snooze time not yet reached, treat as inactive
  if (state.snoozedUntil[id] && state.snoozedUntil[id] > now) {
    return false;
  }

  return true;
}

interface GeneratorParams {
  student: StudentProfile;
  currentLearningContext: CurrentLearningContext;
  lastQuizResult: QuizResult | null;
  subjects: SubjectData[];
  reminderSettings: ReminderSettings;
}

/**
 * Generates ONE context-aware, prioritized study reminder for the student.
 * Prioritization:
 * 1. Unfinished Lesson
 * 2. Weak Topic reinforcement
 * 3. Pending Quiz
 * 4. Revision reminder
 * 5. Daily study reminder
 * 6. Streak reminder
 */
export function generateSmartReminder({
  student,
  currentLearningContext,
  lastQuizResult,
  subjects,
  reminderSettings
}: GeneratorParams): StudyReminder | null {
  if (!reminderSettings.enabled) {
    return null;
  }

  const subject = currentLearningContext.subject || 'Mathematics';
  const chapter = currentLearningContext.chapter || 'Number Systems';
  const topic = currentLearningContext.topic || 'Irrational Numbers and Decimal Expansions';

  const curSubjectData = subjects.find((s) => s.name === subject);
  const weakTopic =
    (lastQuizResult?.weakTopics && lastQuizResult.weakTopics[0]) ||
    (curSubjectData?.weaknesses && curSubjectData.weaknesses[0]);

  const candidates: StudyReminder[] = [];

  // Priority 1: Unfinished lesson
  if (reminderSettings.remindUnfinishedLessons) {
    candidates.push({
      id: `rem-unfinished-${subject}-${chapter}`.toLowerCase().replace(/\s+/g, '-'),
      type: 'continue_lesson',
      title: "📚 Today's Learning Reminder",
      message: `Continue: ${chapter} • 10 minutes recommended`,
      subject,
      chapter,
      topic,
      actionText: 'Start Learning',
      actionTab: 'adaptive',
      priority: 1,
      estimatedMinutes: 10,
      createdAt: new Date().toISOString()
    });
  }

  // Priority 2: Weak Topic practice
  if (reminderSettings.remindWeakTopics && weakTopic) {
    candidates.push({
      id: `rem-weak-${weakTopic}`.toLowerCase().replace(/\s+/g, '-'),
      type: 'weak_topic',
      title: '🧠 Targeted Concept Practice',
      message: `Practice ${weakTopic} for 10 minutes today to strengthen your understanding.`,
      subject,
      chapter,
      topic: weakTopic,
      actionText: 'Strengthen Concept',
      actionTab: 'adaptive',
      priority: 2,
      estimatedMinutes: 10,
      createdAt: new Date().toISOString()
    });
  }

  // Priority 3: Pending Quiz
  if (reminderSettings.remindPendingQuizzes) {
    candidates.push({
      id: `rem-quiz-${subject}-${topic}`.toLowerCase().replace(/\s+/g, '-'),
      type: 'quiz_pending',
      title: '📝 Quiz Reminder',
      message: `Your ${chapter} quiz on "${topic}" is ready for testing!`,
      subject,
      chapter,
      topic,
      actionText: 'Take Quiz',
      actionTab: 'quiz',
      priority: 3,
      estimatedMinutes: 10,
      createdAt: new Date().toISOString()
    });
  }

  // Priority 4: Revision
  candidates.push({
    id: `rem-revision-${subject}`.toLowerCase().replace(/\s+/g, '-'),
    type: 'revision',
    title: '🔄 Concept Revision',
    message: `It's a good time to revise core points of ${topic}.`,
    subject,
    chapter,
    topic,
    actionText: 'Revise Topic',
    actionTab: 'adaptive',
    priority: 4,
    estimatedMinutes: 10,
    createdAt: new Date().toISOString()
  });

  // Priority 5: Daily Study
  candidates.push({
    id: `rem-daily-${subject}`.toLowerCase().replace(/\s+/g, '-'),
    type: 'daily',
    title: '📚 Daily Learning Habit',
    message: `Time to continue your learning journey in ${subject}!`,
    subject,
    chapter,
    topic,
    actionText: 'Start Learning',
    actionTab: 'adaptive',
    priority: 5,
    estimatedMinutes: 15,
    createdAt: new Date().toISOString()
  });

  // Priority 6: Streak reminder
  candidates.push({
    id: `rem-streak-${student.streak}`,
    type: 'streak',
    title: '🔥 Streak Protected',
    message: `Your ${student.streak}-day learning streak is waiting for you! Keep up the momentum.`,
    subject,
    chapter,
    topic,
    actionText: 'Study Today',
    actionTab: 'adaptive',
    priority: 6,
    estimatedMinutes: 10,
    createdAt: new Date().toISOString()
  });

  // Pick the highest priority reminder that is not snoozed or dismissed
  for (const candidate of candidates) {
    if (isReminderActive(candidate.id)) {
      return candidate;
    }
  }

  // If all are dismissed/snoozed, fall back to the top candidate (or null)
  return candidates[0] || null;
}
