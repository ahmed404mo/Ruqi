"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Circle, Play, ShieldAlert } from "lucide-react";
import { markLessonCompleted } from "@/lib/progress";
import {
  getContentById,
  getMonthContent,
  getEducationalMonthById,
  getEducationalStageById,
  ContentDetails,
  ContentItem,
  ContentQuestion,
  EducationalMonth,
  EducationalStage,
} from "@/lib/api";
import MonthDrawer, { MonthDrawerButton } from "@/components/MonthDrawer";

export default function AssignmentPage({ params }: { params: Promise<{ contentId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [month, setMonth] = useState<EducationalMonth | null>(null);
  const [stage, setStage] = useState<EducationalStage | null>(null);
  const [monthContentList, setMonthContentList] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const contentData = await getContentById(contentId);
        if (!active) return;
        setContent(contentData);

        if (contentData && contentData.month) {
          const [monthItems, monthData] = await Promise.all([
            getMonthContent(contentData.month),
            getEducationalMonthById(contentData.month),
          ]);
          if (!active) return;

          setMonthContentList([...monthItems].sort((a, b) => a.order - b.order));
          setMonth(monthData);

          if (monthData && monthData.stage) {
            try {
              const stageData = await getEducationalStageById(monthData.stage);
              if (active) setStage(stageData);
            } catch {}
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

  if (isLoading) {
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
        <h3 className="font-extrabold text-[24px] text-danger mb-3">عذراً، الواجب غير متوفر</h3>
        <Link
          href="/educational-content"
          className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-[15px] hover:bg-primary-hover transition-colors flex items-center justify-center"
        >
          العودة للمراحل التعليمية
        </Link>
      </div>
    );
  }

  const currentIndex = monthContentList.findIndex((item) => item._id === content._id);
  const contentPosition = currentIndex === -1 ? content.order : currentIndex + 1;
  const totalItems = monthContentList.length || 1;

  const questions: ContentQuestion[] = content.homework || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length || 1;
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOptions((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    let correct = 0;
    const total = questions.length;
    questions.forEach((q, idx) => {
      const chosen = selectedOptions[idx];
      if (chosen !== undefined && q.correctAnswers.includes(chosen)) {
        correct += 1;
      }
    });
    const scorePct = total === 0 ? 0 : Math.round((correct / total) * 100);
    markLessonCompleted(contentId);
    try {
      localStorage.setItem(`ruqi_answers_${contentId}`, JSON.stringify(selectedOptions));
    } catch {}
    router.push(
      `/educational-content/content/${contentId}/assignment/result?score=${scorePct}&correct=${correct}&total=${total}`,
    );
  };

  return (
    <div
      className="w-full min-h-screen bg-background flex flex-col items-center py-8 sm:py-12 md:py-20 px-4 md:px-8 lg:px-20 relative font-cairo"
      dir="rtl"
    >
      <main className="flex flex-col items-start gap-6 md:gap-8 w-full max-w-[1280px] flex-1">
        <nav className="flex flex-row items-center justify-start   gap-1.5 sm:gap-2 w-full text-[12px] sm:text-[14px] pt-15 text-text-muted flex-wrap">
          <span className="font-bold text-primary">{stage?.title || content.month || "المرحلة"}</span>
          <span className="text-[10px] sm:text-[12px]">&gt;</span>
          <Link
            href={month ? `/educational-content/month/${month._id}` : "#"}
            className="hover:text-primary transition-colors"
          >
            {month?.title || "محتوى الشهر"}
          </Link>
          <span className="text-[10px] sm:text-[12px]">&gt;</span>
          <span className="font-medium text-text-muted">{content.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row items-start gap-8 md:gap-10 w-full mb-10">
          <div className="flex flex-col items-start gap-6 md:gap-8 flex-1 w-full min-w-0">
            <h1 className="font-extrabold text-[22px] sm:text-[24px] md:text-[28px] lg:text-[32px] text-text-main leading-tight w-full">
              واجب — {content.title}
            </h1>

            <div className="w-full bg-surface border border-border shadow-sm rounded-card p-5 sm:p-8 md:p-10 flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex justify-between items-center w-full flex-wrap gap-2">
                  <span className="font-bold text-[13px] sm:text-[14px] text-primary">
                    التقدم: {progressPercentage}٪ ({currentQuestionIndex + 1} من {totalQuestions})
                  </span>
                  <span className="font-extrabold text-[15px] sm:text-[16px] text-text-main">
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
                <div className="flex flex-col gap-6 md:gap-8 w-full">
                  <h2 className="font-bold text-[16px] sm:text-[18px] md:text-[20px] text-text-main leading-relaxed w-full break-words">
                    {currentQuestion.questionText}
                  </h2>

                  <div className="flex flex-col gap-3 md:gap-4 w-full">
                    {currentQuestion.options.map((option, optIdx) => {
                      const isSelected = selectedOptions[currentQuestionIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleOptionSelect(optIdx)}
                          className={`flex items-start sm:items-center justify-between w-full min-h-[56px] sm:min-h-[64px] p-4 sm:px-[18px] rounded-xl transition-all duration-200 text-right border-[1.5px] ${
                            isSelected
                              ? "bg-primary-light border-primary shadow-[0_4px_12px_rgba(196,154,69,0.07)]"
                              : "bg-surface border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-full flex items-center justify-center shrink-0 border-2 transition-colors mt-0.5 sm:mt-0 ${
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
                <div className="text-center py-10 text-text-muted font-bold text-[14px] sm:text-[15px]">
                  لا توجد أسئلة مضافة لهذا الواجب بعد.
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-2 w-full border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentQuestionIndex > 0) setCurrentQuestionIndex((p) => p - 1);
                  }}
                  disabled={currentQuestionIndex === 0}
                  className="order-2 sm:order-1 w-full sm:w-auto flex justify-center items-center gap-2 px-6 md:px-8 py-3.5 rounded-xl font-bold text-[14px] sm:text-[15px] text-text-muted border border-border bg-transparent hover:bg-surface-secondary disabled:opacity-40 transition-all"
                >
                  <span className="mt-0.5">&lt;</span>
                  <span>السابق</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex((p) => p + 1);
                    } else {
                      handleSubmit();
                    }
                  }}
                  className="order-1 sm:order-2 w-full sm:w-auto flex justify-center items-center gap-2 px-6 md:px-8 py-3.5 rounded-xl font-bold text-[14px] sm:text-[15px] text-footer bg-primary hover:bg-primary-hover disabled:opacity-50 shadow-[0_8px_16px_rgba(196,154,69,0.14)] transition-all"
                >
                  <span>{currentQuestionIndex >= questions.length - 1 ? "تسليم الواجب" : "السؤال التالي"}</span>
                  <span className="mt-0.5">&gt;</span>
                </button>
              </div>
            </div>

            <div className="w-full flex flex-row items-start gap-4 p-4 sm:p-5 bg-warning-bg border border-warning/30 rounded-card">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
                <ShieldAlert size={18} className="text-warning" />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h4 className="font-bold text-[14px] sm:text-[15px] text-warning">مطلوب مذاكرته من الكتاب</h4>
                <p className="font-medium text-[12px] sm:text-[13px] text-warning leading-relaxed break-words">
                  يرجى مراجعة المقرر المطبوع أو صفحات الكتاب المدرسي للتمكن من فهم أحكام وقواعد الدرس بشكل صحيح قبل
                  استكمال الواجب.
                </p>
              </div>
            </div>

            <Link
              href={`/educational-content/content/${contentId}`}
              className="w-full h-[52px] bg-surface hover:bg-primary-light border border-border text-text-main font-bold text-[14px] sm:text-[15px] rounded-xl transition-colors flex items-center justify-center"
            >
              العودة إلى الدرس
            </Link>
          </div>

          <aside className="hidden lg:flex w-full lg:w-[360px] bg-surface border border-border shadow-[0_8px_24px_rgba(84,70,58,0.04)] rounded-card p-6 flex-col gap-6 lg:sticky lg:top-24 shrink-0">
            <div className="flex flex-col items-start gap-3 pb-3 border-b border-border w-full">
              <span className="font-bold text-[14px] text-primary">
                الدرس {contentPosition} من {totalItems} في هذا المنهج
              </span>
              <h3 className="font-extrabold text-[18px] text-text-main">
                {month ? `محتويات ${month.title}` : "محتويات الشهر"}
              </h3>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {monthContentList.length === 0 ? (
                <div className="text-center py-6 font-medium text-sm text-text-muted">
                  لا توجد عناصر في هذا الشهر بعد.
                </div>
              ) : (
                monthContentList.map((item, index) => {
                  const isCurrent = item._id === content._id;
                  const isCompleted = currentIndex !== -1 && index < currentIndex;
                  const isLessonItem = item.type === "LESSON";
                  const href = isLessonItem
                    ? `/educational-content/content/${item._id}`
                    : `/educational-content/exam/${item._id}`;

                  return (
                    <Link
                      href={href}
                      key={item._id}
                      className={`flex flex-row items-center justify-between p-4 rounded-xl transition-all duration-200 w-full min-h-[58px] ${
                        isCurrent
                          ? "bg-primary-light border border-primary"
                          : isCompleted
                            ? "bg-transparent border border-primary"
                            : "bg-transparent border border-border"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 ml-3 ${
                          isCurrent
                            ? "bg-primary text-surface"
                            : isCompleted
                              ? "bg-success-bg text-success"
                              : "bg-surface-secondary text-text-main"
                        }`}
                      >
                        {isCurrent ? (
                          <Play size={12} fill="currentColor" className="ml-0.5" />
                        ) : isCompleted ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <Circle size={8} fill="currentColor" />
                        )}
                      </div>
                      <span
                        className={`text-[14px] truncate flex-1 text-right ${
                          isCurrent
                            ? "font-bold text-primary-hover"
                            : isCompleted
                              ? "font-medium text-text-main"
                              : "font-medium text-text-muted"
                        }`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </main>

      <MonthDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={month ? `محتويات ${month.title}` : "محتويات الشهر"}
        contentList={monthContentList}
        currentContentId={content._id}
        currentIndex={currentIndex}
        contentPosition={contentPosition}
        totalItems={totalItems}
      />
      <MonthDrawerButton onClick={() => setDrawerOpen(true)} />
    </div>
  );
}
