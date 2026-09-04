"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Timer, Trophy, PlayCircle, Play, Check, Circle } from "lucide-react";
import {
  getContentById,
  getMonthContent,
  getEducationalMonthById,
  getEducationalStageById,
  ContentDetails,
  ContentItem,
  EducationalMonth,
  EducationalStage,
} from "@/lib/api";
import MonthDrawer, { MonthDrawerButton } from "@/components/MonthDrawer";
import Loading from "@/app/loading";

const EXAM_DURATION_MINUTES = 30;

export default function ExamOverviewPage({ params }: { params: Promise<{ contentId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [month, setMonth] = useState<EducationalMonth | null>(null);
  const [stage, setStage] = useState<EducationalStage | null>(null);
  const [monthContentList, setMonthContentList] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchExamDetails = async () => {
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

    if (contentId) fetchExamDetails();

    return () => {
      active = false;
    };
  }, [contentId]);

  if (isLoading) {
    return <Loading />;
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

  const currentIndex = monthContentList.findIndex((item) => item._id === content._id);
  const contentPosition = currentIndex === -1 ? content.order : currentIndex + 1;
  const totalItems = monthContentList.length || 1;

  const questionsCount = content.examQuestions?.length || 20;

  const instructions = [
    "يرجى التأكد من استقرار اتصال الإنترنت قبل بدء الاختبار.",
    "بمجرد الضغط على زر (ابدأ الاختبار) سيبدأ المؤقت التنازلي مباشرة ولا يمكن إيقافه مؤقتاً.",
    "يسمح بتقديم الاختبار لمرة واحدة فقط لكل دورة دورية شهرية.",
    "يتم احتساب الدرجات وإرسال تقرير الأداء فور تسليم الاختبار.",
    "الالتزام بالوقت يسهم إيجاباً في ترتيبك العام على لوحة متفوقي منصة رُقِيّ.",
  ];

  return (
    <div
      className="w-full min-h-screen bg-background flex flex-col items-center py-12 md:py-20 px-4 md:px-8 lg:px-20 relative font-cairo"
      dir="rtl"
    >
      <main className="flex flex-col items-start gap-6 md:gap-8 w-full max-w-[1280px] flex-1">
        <nav className="flex flex-row items-center justify-start gap-1.5 sm:gap-2 w-full text-[12px] sm:text-[14px] text-text-muted flex-wrap">
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
          <div className="flex flex-col gap-6 md:gap-8 flex-1 w-full min-w-0">
            <div className="flex flex-col items-start gap-3 w-full">
              <span className="bg-warning-bg text-warning font-bold text-[12px] px-3.5 py-1.5 rounded-control border border-warning/30">
                اختبار تقويمي معتمد
              </span>
              <h1 className="font-extrabold text-[22px] sm:text-[24px] md:text-[28px] lg:text-[32px] text-text-main leading-tight">
                {content.title}
              </h1>
              <p className="font-medium text-[14px] md:text-[15px] text-text-muted leading-relaxed max-w-[700px]">
                {content.description ||
                  "اختبر مدى استيعابك لمقرر هذا الشهر من خلال هذا الاختبار التقويمي المعتمد والمصمم لقياس مستواك الدقيق."}
              </p>
            </div>

            <div className="grid grid-cols-2  sm:grid-cols-3 gap-4 md:gap-6 w-full justify-between">
              <div className="bg-surface border border-border shadow-sm rounded-card p-6 flex flex-col items-center text-center gap-2.5 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary-border">
                  <ClipboardList size={22} strokeWidth={2.5} />
                </div>
                <span className="font-black text-[24px] md:text-[28px] text-text-main leading-none mt-1">
                  {questionsCount} سؤالاً
                </span>
                <span className="font-semibold text-[13px] sm:text-[14px] text-text-muted">عدد الأسئلة الكلية</span>
              </div>

              <div className="bg-surface border border-border shadow-sm rounded-card p-6 flex flex-col items-center text-center gap-2.5 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary-border">
                  <Timer size={22} strokeWidth={2.5} />
                </div>
                <span className="font-black text-[24px] md:text-[28px] text-text-main leading-none mt-1">
                  {EXAM_DURATION_MINUTES} دقيقة
                </span>
                <span className="font-semibold text-[13px] sm:text-[14px] text-text-muted">المدة المتاحة</span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-surface border border-border shadow-sm rounded-card p-6 flex flex-col items-center text-center gap-2.5 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary-border">
                  <Trophy size={22} strokeWidth={2.5} />
                </div>
                <span className="font-black text-[24px] md:text-[28px] text-text-main leading-none mt-1">
                  {typeof content.passPercentage === "number" ? `${content.passPercentage}٪` : "١٠٠٪"}
                </span>
                <span className="font-semibold  text-[13px] sm:text-[14px] text-text-muted">نسبة النجاح</span>
              </div>
            </div>

            <div className="bg-surface border border-border shadow-sm rounded-card p-5 sm:p-8 md:p-10 flex flex-col gap-6 w-full">
              <h3 className="font-extrabold text-[18px] sm:text-[20px] text-text-main border-b border-border pb-4">
                تعليمات وإرشادات الاختبار الهامّة
              </h3>

              <div className="flex flex-col gap-4">
                {instructions.map((instruction, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-primary-light text-primary font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 border border-primary-border">
                      {idx + 1}
                    </span>
                    <p className="font-medium text-[14px] sm:text-[15px] text-text-main leading-relaxed">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-border flex justify-end w-full mt-2">
                <Link
                  href={`/educational-content/exam/${contentId}/take`}
                  className="w-full sm:w-auto h-[52px] sm:h-[58px] px-8 sm:px-12 bg-primary hover:bg-primary-hover text-footer font-bold text-[15px] sm:text-[16px] rounded-xl shadow-[0_8px_16px_rgba(196,154,69,0.14)] transition-all flex items-center justify-center gap-2.5 active:scale-95"
                >
                  <PlayCircle size={20} strokeWidth={2.5} />
                  <span>ابدأ الاختبار الآن</span>
                </Link>
              </div>
            </div>
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
