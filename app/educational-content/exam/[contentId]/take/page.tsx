"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  getContentById,
  getMonthContent,
  getEducationalMonthById,
  getEducationalStageById,
  ContentDetails,
  ContentQuestion,
  EducationalMonth,
  EducationalStage,
} from "@/lib/api";
import { markExamCompleted } from "@/lib/progress";

const EXAM_DURATION_SECONDS = 30 * 60;

function getStorageKey(contentId: string, suffix: string) {
  return `exam_${contentId}_${suffix}`;
}

function getRemainingTime(contentId: string): number {
  if (typeof window === "undefined") return EXAM_DURATION_SECONDS;
  const startStr = localStorage.getItem(getStorageKey(contentId, "start"));
  if (!startStr) return EXAM_DURATION_SECONDS;
  const start = parseInt(startStr, 10);
  if (isNaN(start)) return EXAM_DURATION_SECONDS;
  const elapsed = Math.floor((Date.now() - start) / 1000);
  return Math.max(0, EXAM_DURATION_SECONDS - elapsed);
}

function saveAnswers(contentId: string, answers: Record<number, number>) {
  try {
    localStorage.setItem(getStorageKey(contentId, "answers"), JSON.stringify(answers));
  } catch {}
}

function loadAnswers(contentId: string): Record<number, number> {
  try {
    const raw = localStorage.getItem(getStorageKey(contentId, "answers"));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

const MAX_VIOLATIONS = 5;

function clearExamStorage(contentId: string) {
  try {
    localStorage.removeItem(getStorageKey(contentId, "start"));
    localStorage.removeItem(getStorageKey(contentId, "violations"));
  } catch {}
}

function loadViolations(contentId: string): number {
  try {
    const raw = localStorage.getItem(getStorageKey(contentId, "violations"));
    if (raw) return parseInt(raw, 10) || 0;
  } catch {}
  return 0;
}

function saveViolations(contentId: string, count: number) {
  try {
    localStorage.setItem(getStorageKey(contentId, "violations"), String(count));
  } catch {}
}

export default function ExamTakingPage({ params }: { params: Promise<{ contentId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [month, setMonth] = useState<EducationalMonth | null>(null);
  const [stage, setStage] = useState<EducationalStage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [timerInitialized, setTimerInitialized] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");

  const submitExam = useCallback(() => {
    const qs = content?.examQuestions || content?.homework || [];
    let correct = 0;
    const total = qs.length;
    if (total > 0) {
      qs.forEach((q, idx) => {
        const chosen = selectedAnswers[idx];
        if (chosen !== undefined && q.correctAnswers.includes(chosen)) {
          correct += 1;
        }
      });
    }
    const scorePct = total === 0 ? 0 : Math.round((correct / total) * 100);
    markExamCompleted(contentId, scorePct);
    try {
      localStorage.setItem(`exam_${contentId}_answers`, JSON.stringify(selectedAnswers));
      localStorage.setItem(`exam_${contentId}_result`, JSON.stringify({ score: scorePct, correct, total }));
    } catch {}
    clearExamStorage(contentId);
    router.replace(`/educational-content/exam/${contentId}/result?score=${scorePct}&correct=${correct}&total=${total}`);
  }, [content, selectedAnswers, contentId, router]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const data = await getContentById(contentId);
        if (!active) return;
        setContent(data);

        if (data && data.month) {
          const monthData = await getEducationalMonthById(data.month);
          if (active && monthData) {
            setMonth(monthData);
            if (monthData.stage) {
              const stageData = await getEducationalStageById(monthData.stage);
              if (active) setStage(stageData);
            }
          }
        }
      } catch {
        if (active) setContent(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    if (contentId) fetchData();
    return () => {
      active = false;
    };
  }, [contentId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = localStorage.getItem(getStorageKey(contentId, "start"));
    if (!existing) {
      localStorage.setItem(getStorageKey(contentId, "start"), String(Date.now()));
    }
    setTimeLeft(getRemainingTime(contentId));
    setSelectedAnswers(loadAnswers(contentId));
    setViolations(loadViolations(contentId));
    setTimerInitialized(true);
  }, [contentId]);

  useEffect(() => {
    if (!timerInitialized) return;
    if (timeLeft <= 0) {
      submitExam();
      return;
    }
    const timer = setInterval(() => {
      const remaining = getRemainingTime(contentId);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        submitExam();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timerInitialized, contentId, router, submitExam]);

  useEffect(() => {
    if (timerInitialized) {
      saveAnswers(contentId, selectedAnswers);
    }
  }, [selectedAnswers, contentId, timerInitialized]);

  useEffect(() => {
    if (!timerInitialized) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [timerInitialized]);

  useEffect(() => {
    if (!timerInitialized) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((prev) => {
          const next = prev + 1;
          saveViolations(contentId, next);
          if (next >= MAX_VIOLATIONS) {
            setViolationMessage("تم تجاوز الحد المسموح للمخالفات. سيتم تسليم الاختبار تلقائياً.");
            setShowViolationWarning(true);
            setTimeout(() => {
              submitExam();
            }, 2500);
          } else {
            setViolationMessage(`تنبيه: لقد غادرت صفحة الاختبار! مخالفة ${next} من ${MAX_VIOLATIONS}.`);
            setShowViolationWarning(true);
            setTimeout(() => setShowViolationWarning(false), 3000);
          }
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [timerInitialized, contentId, router, submitExam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !timerInitialized) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo"
        dir="rtl"
      >
        <h3 className="font-extrabold text-[24px] text-danger mb-3">عذراً، الاختبار غير متوفر</h3>
        <Link
          href="/educational-content"
          className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-[15px] hover:bg-primary-hover transition-colors flex items-center justify-center"
        >
          العودة للمراحل التعليمية
        </Link>
      </div>
    );
  }

  const questions: ContentQuestion[] = content.examQuestions || content.homework || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length || 1;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIdx }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitExam();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-cairo overflow-x-hidden" dir="rtl">
      {showViolationWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div
            className={`flex flex-col items-center gap-4 p-6 sm:p-8 bg-surface border-2 rounded-[20px] max-w-[420px] w-full text-center shadow-xl ${
              violations >= MAX_VIOLATIONS ? "border-danger shadow-danger/20" : "border-warning shadow-warning/20"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-[32px] ${
                violations >= MAX_VIOLATIONS ? "bg-danger-bg text-danger" : "bg-warning-bg text-warning"
              }`}
            >
              {violations >= MAX_VIOLATIONS ? "✕" : "!"}
            </div>
            <p
              className={`font-bold text-[16px] sm:text-[18px] leading-relaxed ${violations >= MAX_VIOLATIONS ? "text-danger" : "text-warning"}`}
            >
              {violationMessage}
            </p>
            {violations < MAX_VIOLATIONS && (
              <p className="font-medium text-[13px] sm:text-[14px] text-text-muted leading-[22px]">
                يُرجى البقاء في صفحة الاختبار حتى انتهاء الوقت أو تسليم الإجابات لمنع إلغاء الاختبار.
              </p>
            )}
          </div>
        </div>
      )}

      <header className="w-full bg-footer px-4 sm:px-8 md:px-20 h-[72px] sm:h-[88px] flex flex-row justify-between items-center shrink-0 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4 h-full">
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 w-[45px] h-[45px] sm:w-[60px] sm:h-[60px]"
          >
            <rect width="60" height="60" rx="10" fill="#D4AF37" />
            <path
              d="M22.3987 25.056C22.2281 25.3333 21.9721 25.5893 21.6307 25.824C21.2894 26.0587 20.9374 26.1973 20.5747 26.24H20.5107C19.3587 26.176 18.7827 25.568 18.7827 24.416C18.7827 24.3733 18.7827 24.3413 18.7827 24.32C18.7827 24.2987 18.7827 24.2773 18.7827 24.256C18.7827 23.8933 18.8254 23.5627 18.9107 23.264C18.9961 22.944 19.0814 22.6453 19.1667 22.368C19.1667 22.3467 19.1774 22.336 19.1987 22.336C19.1987 22.336 19.1987 22.3253 19.1987 22.304C19.1987 22.2613 19.2094 22.2293 19.2307 22.208C19.2307 22.1653 19.2414 22.1227 19.2627 22.08L19.2307 22.144C19.2947 21.9733 19.3907 21.792 19.5187 21.6C19.6254 21.408 19.8067 21.3227 20.0627 21.344C20.2334 21.3867 20.3187 21.504 20.3187 21.696C20.3187 21.7173 20.3294 21.7387 20.3507 21.76C20.3507 21.76 20.3401 21.7813 20.3187 21.824C20.3187 21.8453 20.3187 21.8773 20.3187 21.92C20.2974 21.9413 20.2867 21.9627 20.2867 21.984C20.2227 22.2613 20.1907 22.5707 20.1907 22.912V23.104C20.2547 23.3813 20.4147 23.5627 20.6707 23.648C20.6707 23.648 20.6814 23.648 20.7027 23.648C20.7027 23.6267 20.7134 23.616 20.7347 23.616C20.9054 23.616 21.0867 23.584 21.2787 23.52C21.4494 23.456 21.5774 23.36 21.6628 23.232C21.9401 22.848 22.1001 22.336 22.1427 21.696L22.7188 21.184C22.8254 21.0773 22.9428 21.056 23.0708 21.12C23.1988 21.1627 23.2628 21.2587 23.2628 21.408C23.2628 21.4293 23.2628 21.4507 23.2628 21.472C23.2628 21.472 23.2628 21.4827 23.2628 21.504V21.6C23.2628 21.6213 23.2521 21.6427 23.2308 21.664C23.2308 21.6853 23.2308 21.7173 23.2308 21.76C23.2308 21.8027 23.2308 21.8347 23.2308 21.856C23.2308 21.8773 23.2308 21.9093 23.2308 21.952C23.2308 22.1227 23.2414 22.2827 23.2628 22.432C23.3054 22.56 23.3694 22.6667 23.4548 22.752C23.6681 22.9653 23.8281 23.072 23.9348 23.072H23.9668C24.1374 23.0293 24.2654 22.9333 24.3508 22.784C24.4574 22.6133 24.5321 22.4427 24.5748 22.272L24.5428 22.304C24.6068 22.0693 24.6388 21.8773 24.6388 21.728V21.6C24.6388 21.4933 24.6708 21.408 24.7348 21.344L25.3108 20.832C25.4174 20.7253 25.5348 20.704 25.6628 20.768C25.7908 20.832 25.8548 20.9387 25.8548 21.088C25.8548 21.1307 25.8441 21.1733 25.8228 21.216C25.8228 21.2587 25.8228 21.3013 25.8228 21.344C25.7801 21.92 25.7161 22.5067 25.6308 23.104C25.5454 23.68 25.3961 24.192 25.1828 24.64C24.9694 25.1093 24.6494 25.44 24.2228 25.632C24.0734 25.696 23.9134 25.728 23.7428 25.728C23.4654 25.728 23.2094 25.6533 22.9748 25.504C22.7401 25.3547 22.5481 25.2053 22.3987 25.056ZM25.0228 49.928C24.9801 50.0133 24.8948 50.088 24.7668 50.152C23.7854 50.3227 22.8148 50.504 21.8547 50.696C20.8734 50.888 19.8921 51.0693 18.9107 51.24C18.7614 51.2613 18.6441 51.208 18.5587 51.08C18.4521 50.9733 18.4414 50.8453 18.5267 50.696L20.3187 47.048C20.3401 47.0053 20.3827 46.9733 20.4467 46.952C20.5107 46.9093 20.5641 46.8773 20.6068 46.856C21.6094 46.6853 22.5907 46.5147 23.5508 46.344C24.5321 46.152 25.5028 45.96 26.4628 45.768C26.6121 45.7253 26.7401 45.768 26.8468 45.896C26.9534 46.0027 26.9534 46.1413 26.8468 46.312L25.0228 49.928ZM15.022 37.744C15.022 38.576 15.2353 39.2373 15.662 39.728C16.11 40.2187 16.6967 40.5707 17.422 40.784C18.1473 40.9973 18.958 41.104 19.854 41.104C20.2593 41.104 20.654 41.0827 21.038 41.04C21.422 40.9973 21.8167 40.944 22.222 40.88C23.5447 40.6453 24.7607 40.2933 25.87 39.824C26.9793 39.3333 28.046 38.8107 29.07 38.256L29.006 38.224C28.4087 38.0107 27.79 37.8293 27.15 37.68C26.5313 37.5307 25.8807 37.392 25.198 37.264L24.078 37.008C23.63 36.88 23.534 36.5173 23.79 35.92C24.0247 35.344 24.2913 34.7467 24.59 34.128C24.8887 33.5093 25.1873 32.9333 25.486 32.4C25.5287 32.3573 25.5927 32.3147 25.678 32.272C25.7633 32.208 25.8487 32.1867 25.934 32.208L29.134 32.976C29.6887 33.104 30.2327 33.264 30.766 33.456C31.2993 33.6267 31.758 33.8613 32.142 34.16C32.4193 34.3947 32.558 34.672 32.558 34.992C32.5793 35.312 32.5367 35.6427 32.43 35.984C32.3233 36.304 32.206 36.5813 32.078 36.816L31.886 37.2V37.168C31.4593 37.9787 31.0327 38.7147 30.606 39.376C30.2007 40.016 29.742 40.624 29.23 41.2C28.718 41.7547 28.0673 42.3093 27.278 42.864C26.126 43.6533 24.7607 44.3787 23.182 45.04C21.6033 45.68 19.9287 46 18.158 46C16.558 46 15.246 45.5733 14.222 44.72C13.198 43.8453 12.654 42.7253 12.59 41.36C12.59 41.2533 12.59 41.136 12.59 41.008C12.59 40.88 12.59 40.7627 12.59 40.656C12.59 39.632 12.7073 38.7253 12.942 37.936C13.198 37.1253 13.4753 36.3467 13.774 35.6C13.9233 35.2373 14.0833 34.896 14.254 34.576C14.4247 34.2347 14.5953 33.904 14.766 33.584C15.0647 33.0293 15.374 32.496 15.694 31.984C16.0353 31.4507 16.366 30.96 16.686 30.512C16.7927 30.4053 16.9527 30.32 17.166 30.256C17.4007 30.192 17.5607 30.2773 17.646 30.512C17.6673 30.64 17.6353 30.8107 17.55 31.024H17.582C17.326 31.6 17.0273 32.176 16.686 32.752C16.366 33.328 16.078 33.9253 15.822 34.544C15.7367 34.7573 15.6513 34.9707 15.566 35.184C15.502 35.376 15.4273 35.5893 15.342 35.824C15.1287 36.464 15.022 37.104 15.022 37.744ZM25.672 44.92C26.6747 44.4933 27.7627 44.0773 28.936 43.672C30.088 43.2453 31.1867 42.8507 32.232 42.488C32.3813 42.4453 32.5093 42.4773 32.616 42.584C32.7227 42.6693 32.7227 42.7973 32.616 42.968L31.656 44.536L28.168 45.784C27.6133 45.976 27.08 46.1893 26.568 46.424C26.0347 46.6373 25.5227 46.8613 25.032 47.096C24.8827 47.1813 24.7547 47.16 24.648 47.032C24.5413 46.904 24.5307 46.7653 24.616 46.616L25.672 44.92ZM30.179 16.928C30.1363 17.0133 30.051 17.088 29.923 17.152C28.9417 17.3227 27.971 17.504 27.011 17.696C26.0297 17.888 25.0483 18.0693 24.067 18.24C23.9177 18.2613 23.8003 18.208 23.715 18.08C23.6083 17.9733 23.5977 17.8453 23.683 17.696L25.475 14.048C25.4963 14.0053 25.539 13.9733 25.603 13.952C25.667 13.9093 25.7203 13.8773 25.763 13.856C26.7657 13.6853 27.747 13.5147 28.707 13.344C29.6883 13.152 30.659 12.96 31.619 12.768C31.7683 12.7253 31.8963 12.768 32.003 12.896C32.1097 13.0027 32.1097 13.1413 32.003 13.312L30.179 16.928ZM29.4368 29.8H29.4688L29.4368 29.768V29.8ZM26.6528 30.984C27.1434 30.8133 27.6234 30.632 28.0928 30.44C28.5834 30.2267 29.0314 29.9813 29.4368 29.704C29.4154 29.4693 29.3621 29.256 29.2768 29.064C29.2128 28.8507 29.1488 28.6053 29.0848 28.328L28.8608 27.56C28.6474 27.752 28.3594 27.9227 27.9968 28.072C27.6341 28.2 27.2608 28.264 26.8768 28.264C26.3861 28.264 25.9808 28.1573 25.6608 27.944C25.3407 27.7093 25.1701 27.3467 25.1487 26.856V26.76C25.1487 26.312 25.2447 25.928 25.4367 25.608L25.9808 24.488H25.9488C26.1834 23.9973 26.4181 23.5173 26.6528 23.048C26.9088 22.5573 27.1968 22.1093 27.5168 21.704C27.9008 21.192 28.3381 20.936 28.8288 20.936C29.1274 20.936 29.4261 21.0427 29.7248 21.256C30.4288 21.7467 30.9941 22.44 31.4208 23.336C31.8688 24.2107 32.1034 25.224 32.1248 26.376V26.664C32.1248 27.2613 32.0714 27.8053 31.9648 28.296C31.8581 28.7867 31.7194 29.256 31.5488 29.704L31.5808 29.672C31.4101 30.2053 31.1541 30.76 30.8128 31.336C30.4928 31.912 30.1834 32.4133 29.8848 32.84C29.8634 32.8613 29.7994 32.904 29.6927 32.968C29.6074 33.0107 29.5328 33.0213 29.4688 33L26.4288 32.232C26.3434 32.1893 26.2581 32.1253 26.1728 32.04C26.1088 31.9333 26.1088 31.816 26.1728 31.688L26.3968 31.176C26.4181 31.1547 26.4608 31.1227 26.5247 31.08C26.5888 31.016 26.6314 30.984 26.6528 30.984ZM37.157 34.144C36.9437 34.144 36.837 34.0267 36.837 33.792C36.837 33.6427 36.9863 33.472 37.285 33.28L37.989 32.832C38.6077 32.4267 39.269 32.0213 39.973 31.616C40.6557 31.1893 41.2637 30.7413 41.797 30.272C41.5197 30.1013 41.2423 29.888 40.965 29.632C40.6877 29.376 40.549 29.024 40.549 28.576C40.549 28.192 40.677 27.7973 40.933 27.392C41.1677 26.9653 41.477 26.6133 41.861 26.336C42.245 26.0587 42.6397 25.92 43.045 25.92C43.429 25.92 43.717 26.0693 43.909 26.368C44.1223 26.6453 44.229 26.976 44.229 27.36C44.229 27.4027 44.229 27.4347 44.229 27.456C44.229 27.456 44.229 27.4773 44.229 27.52C44.229 27.9467 44.133 28.4693 43.941 29.088C44.133 29.2587 44.2397 29.4933 44.261 29.792C44.261 30.0693 44.197 30.304 44.069 30.496C43.9623 30.688 43.8557 30.8907 43.749 31.104C43.6423 31.296 43.5143 31.3387 43.365 31.232C43.2157 31.1253 43.0983 31.04 43.013 30.976C42.3303 31.8293 41.541 32.4907 40.645 32.96C39.7277 33.4293 38.6397 33.8133 37.381 34.112L37.157 34.144ZM42.181 28.032C42.2663 28.096 42.3517 28.16 42.437 28.224C42.5223 28.2667 42.6077 28.32 42.693 28.384V28.256C42.693 28.1493 42.6823 28.0427 42.661 27.936C42.6397 27.8293 42.5757 27.7973 42.469 27.84C42.341 27.8613 42.245 27.9253 42.181 28.032ZM46.106 36.656C46.3833 36.6773 46.5433 36.848 46.586 37.168V37.296C46.4367 37.9787 46.234 38.704 45.978 39.472C45.722 40.24 45.434 40.9547 45.114 41.616C44.8153 42.2773 44.4847 42.832 44.122 43.28C43.3967 44.112 42.5007 44.7733 41.434 45.264C40.3887 45.7547 39.0873 46 37.53 46H37.242C36.026 45.9573 34.97 45.8933 34.074 45.808C33.114 45.7227 32.4847 45.5413 32.186 45.264C32.0793 45.1573 32.026 44.9973 32.026 44.784C32.026 44.5067 32.154 44.272 32.41 44.08C32.666 43.8667 32.9647 43.6853 33.306 43.536C33.6687 43.3867 33.9993 43.2587 34.298 43.152C34.5967 43.0453 34.938 42.928 35.322 42.8C35.7273 42.6507 36.1647 42.5013 36.634 42.352C37.85 41.968 39.0447 41.552 40.218 41.104C41.4127 40.656 42.5007 40.112 43.482 39.472C44.3353 38.896 44.9967 38.096 45.466 37.072C45.5513 36.7947 45.7647 36.656 46.106 36.656Z"
              fill="#2C2621"
            />
          </svg>
          <h2 className="hidden md:block font-extrabold text-[16px] lg:text-[18px] text-primary truncate max-w-[300px]">
            {content.title}
          </h2>
        </div>

        <div className="flex items-center px-3 sm:px-5 py-1.5 sm:py-2 bg-danger-bg border border-danger rounded-lg shrink-0">
          <span className="font-bold text-[13px] sm:text-[15px] text-danger">الوقت: {formatTime(timeLeft)}</span>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col items-center py-6 sm:py-10 md:py-16 px-4 sm:px-8 md:px-20">
        <div className="w-full max-w-[1080px] flex flex-col items-start gap-4 sm:gap-6 md:gap-8">
          <div className="w-full flex flex-col gap-6 sm:gap-8 p-5 sm:p-8 md:p-12 bg-surface border border-border shadow-sm rounded-[20px] md:rounded-card">
            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              <div className="flex justify-between items-center w-full flex-wrap gap-2">
                <span className="font-bold text-[12px] sm:text-[14px] text-primary">
                  تمت الإجابة: {answeredCount} من {totalQuestions}
                </span>
                <span className="font-extrabold text-[14px] sm:text-[16px] md:text-[18px] text-text-main">
                  السؤال {currentQuestionIndex + 1} من {totalQuestions}
                </span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {currentQuestion ? (
              <div className="flex flex-col gap-6 sm:gap-8 w-full">
                <h2 className="font-bold text-[16px] sm:text-[18px] md:text-[20px] text-text-main leading-relaxed text-right w-full break-words">
                  {currentQuestion.questionText}
                </h2>

                <div className="flex flex-col gap-3 sm:gap-4 w-full">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`flex items-start sm:items-center justify-between w-full min-h-[56px] sm:min-h-[64px] p-3.5 sm:p-4 md:px-5 rounded-xl transition-all duration-200 text-right border-[1.5px] ${
                          isSelected
                            ? "bg-primary-light border-primary shadow-[0_4px_12px_rgba(196,154,69,0.07)]"
                            : "bg-surface border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                              isSelected ? "border-primary bg-primary" : "border-border bg-transparent"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-surface" />}
                          </div>
                          <span
                            className={`font-medium text-[14px] sm:text-[15px] leading-relaxed break-words flex-1 text-right ${isSelected ? "text-primary-hover" : "text-text-main"}`}
                          >
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-text-muted font-bold">
                لا توجد أسئلة متاحة في هذا الاختبار حالياً.
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border mt-2 sm:mt-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="order-2 sm:order-1 w-full sm:w-auto flex justify-center items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-[14px] sm:text-[15px] text-text-muted border border-border bg-transparent hover:bg-surface-secondary disabled:opacity-40 transition-colors"
              >
                <span className="mt-0.5">&lt;</span>
                <span>السابق</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentQuestionIndex >= totalQuestions - 1 && !currentQuestion}
                className="order-1 sm:order-2 w-full sm:w-auto flex justify-center items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-[14px] sm:text-[15px] text-footer bg-primary hover:bg-primary-hover disabled:opacity-50 shadow-[0_8px_16px_rgba(196,154,69,0.14)] transition-colors"
              >
                {currentQuestionIndex >= totalQuestions - 1 ? (
                  <>
                    <span>تسليم الاختبار</span>
                    <CheckCircle2 size={18} />
                  </>
                ) : (
                  <>
                    <span>السؤال التالي</span>
                    <span className="mt-0.5">&gt;</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
