"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Check, Circle } from "lucide-react";
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
import { markLessonCompleted } from "@/lib/progress";
import MonthDrawer, { MonthDrawerButton } from "@/components/MonthDrawer";
import Loading from "@/app/loading";

export default function ContentDetailsPage({ params }: { params: Promise<{ contentId: string }> }) {
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

    const fetchDetails = async () => {
      try {
        const contentData = await getContentById(contentId);
        if (!active) return;

        if (contentData && contentData.type === "EXAM") {
          router.replace(`/educational-content/exam/${contentId}`);
          return;
        }

        setContent(contentData);
        markLessonCompleted(contentId);

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
        if (active) {
          setContent(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (contentId) fetchDetails();

    return () => {
      active = false;
    };
  }, [contentId, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo" dir="rtl">
        <h3 className="font-extrabold text-2xl text-danger mb-3">عذراً، المحتوى غير متوفر</h3>
        <Link
          href="/educational-content"
          className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-base hover:bg-primary-hover transition-colors flex items-center justify-center"
        >
          العودة للمراحل التعليمية
        </Link>
      </div>
    );
  }

  const currentIndex = monthContentList.findIndex((item) => item._id === content._id);
  const contentPosition = currentIndex === -1 ? content.order : currentIndex + 1;
  const totalItems = monthContentList.length || 1;
  const nextItem =
    currentIndex < monthContentList.length - 1 && currentIndex !== -1 ? monthContentList[currentIndex + 1] : null;

  const articleText = content.writtenExplanation || content.description || "";

  const handleNextAction = () => {
    setDrawerOpen(false);
    if (content.homework && content.homework.length > 0) {
      router.push(`/educational-content/content/${contentId}/assignment`);
    } else if (nextItem) {
      router.push(
        nextItem.type === "EXAM"
          ? `/educational-content/exam/${nextItem._id}`
          : `/educational-content/content/${nextItem._id}`,
      );
    } else {
      router.push("/educational-content");
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center py-12 md:py-20 px-4 md:px-20 relative font-cairo" dir="rtl">
      <main className="flex flex-col items-start gap-8 w-full max-w-[1280px] flex-1">
        
        <nav className="flex flex-row items-center pt-10 justify-start gap-2 w-full text-xs md:text-sm text-text-muted flex-wrap" aria-label="مسار التنقل">
          {stage ? (
            <Link href={`/educational-content/stage/${stage._id}`} className="font-bold text-primary hover:underline transition-colors">
              {stage.title}
            </Link>
          ) : (
            <span className="font-bold text-primary">{content.month || "المرحلة"}</span>
          )}
          <span>&gt;</span>
          {month ? (
            <Link href={`/educational-content/month/${month._id}`} className=" text-text-muted hover:text-primary hover:underline transition-colors">
              {month.title}
            </Link>
          ) : (
            <span>{content.month || "محتوى الشهر"}</span>
          )}
          <span>&gt;</span>
          <span className="font-medium text-text-muted">{content.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row items-start gap-10 w-full mb-10">
          
          <div className="flex flex-col items-start gap-6 flex-1 w-full min-w-0">
            
            <h1 className="font-extrabold text-[24px] md:text-[28px] lg:text-[32px] text-text-main leading-tight w-full">
              {content.title}
            </h1>

            {content.videoUrl ? (
              <div className="w-full aspect-video bg-footer rounded-card shadow-[0_16px_48px_-4px_rgba(84,70,58,0.12)] overflow-hidden flex items-center justify-center relative">
                <video key={content.videoUrl} src={content.videoUrl} controls className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-footer rounded-card shadow-[0_16px_48px_-4px_rgba(84,70,58,0.12)] overflow-hidden flex flex-col items-center justify-center relative border border-border">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_8px_24px_rgba(196,154,69,0.25)] mb-4">
                  <Play size={32} className="text-footer ml-1" fill="currentColor" />
                </div>
                <span className="text-primary font-bold text-[16px]">الفيديو غير متوفر حالياً</span>
              </div>
            )}

            {articleText && (
              <div className="w-full bg-surface border border-border shadow-sm rounded-card p-6 md:p-8 flex flex-col gap-4 mt-2">
                <h3 className="font-bold text-[18px] text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  الشرح التفصيلي
                </h3>
                <p className="font-medium text-[15px] text-text-muted leading-[32px] w-full whitespace-pre-wrap break-words">
                  {articleText}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextAction}
              className="w-full h-[58px] bg-primary hover:bg-primary-hover text-footer font-bold text-[16px] rounded-control shadow-[0_12px_32px_rgba(196,154,69,0.1)] transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <span>
                {content.homework && content.homework.length > 0
                  ? "الانتقال إلى الواجب والتطبيقات"
                  : "تمت مشاهدة الدرس المصور والانتقال للتالي"}
              </span>
              <Check size={20} strokeWidth={2.5} />
            </button>
            
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
                      className={`flex flex-row items-center justify-between p-4 rounded-[12px] transition-all duration-200 w-full min-h-[58px] ${
                        isCurrent
                          ? "bg-primary-light border border-primary"
                          : isCompleted
                            ? "bg-transparent border border-primary"
                            : "bg-transparent border border-border"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-[12px] flex items-center justify-center shrink-0 ml-3 ${
                          isCurrent
                            ? "bg-primary text-surface"
                            : isCompleted
                              ? "bg-success-bg text-success"
                              : "bg-surface-secondary text-text-main"
                        }`}
                      >
                        {isCurrent ? <Play size={12} fill="currentColor" className="ml-0.5" /> : isCompleted ? <Check size={14} strokeWidth={3} /> : <Circle size={8} fill="currentColor" />}
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