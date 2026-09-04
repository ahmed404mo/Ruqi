const STORAGE_KEY = "ruqi_student_progress";

export interface ProgressEntry {
  type: "LESSON" | "EXAM";
  completedAt: number;
  scorePercentage?: number;
}

export type ProgressMap = Record<string, ProgressEntry>;

export function getProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as ProgressMap) : {};
  } catch {
    return {};
  }
}

function saveProgress(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function isContentCompleted(contentId: string): boolean {
  return Boolean(getProgress()[contentId]);
}

export function getContentScore(contentId: string): number | undefined {
  return getProgress()[contentId]?.scorePercentage;
}

export function markLessonCompleted(contentId: string) {
  const map = getProgress();
  if (map[contentId]) return; 
  map[contentId] = { type: "LESSON", completedAt: Date.now() };
  saveProgress(map);
}

export function markExamCompleted(contentId: string, scorePercentage: number) {
  const map = getProgress();
  map[contentId] = {
    type: "EXAM",
    completedAt: Date.now(),
    scorePercentage,
  };
  saveProgress(map);
}

export function getMonthSummary(items: { _id: string; type: "LESSON" | "EXAM" }[]): {
  completedCount: number;
  totalCount: number;
  remainingLessons: number;
  remainingExams: number;
  percentage: number;
} {
  const progress = getProgress();
  const totalCount = items.length;
  const completedCount = items.filter((item) => Boolean(progress[item._id])).length;
  const remainingLessons = items.filter(
    (item) => item.type === "LESSON" && !progress[item._id]
  ).length;
  const remainingExams = items.filter(
    (item) => item.type === "EXAM" && !progress[item._id]
  ).length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, remainingLessons, remainingExams, percentage };
}
