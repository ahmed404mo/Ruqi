"use client";

import { Suspense, useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trophy, CheckCircle2, XCircle, Eye, BookOpen } from "lucide-react";
import {
  getContentById,
  getEducationalMonthById,
  getEducationalStageById,
  ContentDetails,
  EducationalMonth,
  EducationalStage,
} from "@/lib/api";

export default function ExamResultPage({ params }: { params: Promise<{ contentId: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full min-h-screen bg-background">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ExamResultInner params={params} />
    </Suspense>
  );
}

function ExamResultInner({ params }: { params: Promise<{ contentId: string }> }) {
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;
  const searchParams = useSearchParams();

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [month, setMonth] = useState<EducationalMonth | null>(null);
  const [stage, setStage] = useState<EducationalStage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [examResult, setExamResult] = useState<{ score: number; correct: number; total: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`exam_${contentId}_result`);
      if (raw) setExamResult(JSON.parse(raw));
    } catch {}
  }, [contentId]);

  useEffect(() => {
    let active = true;

    const fetchResult = async () => {
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

    if (contentId) fetchResult();

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
        <h3 className="font-extrabold text-[24px] text-danger mb-3">عذراً، نتيجة الاختبار غير متوفرة</h3>
        <Link
          href="/educational-content"
          className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-[15px] hover:bg-primary-hover transition-colors flex items-center justify-center"
        >
          العودة للمراحل التعليمية
        </Link>
      </div>
    );
  }

  const scorePercentage = examResult?.score ?? Number(searchParams.get("score") ?? 0);
  const correctAnswersCount = examResult?.correct ?? Number(searchParams.get("correct") ?? 0);
  const totalQuestions = examResult?.total ?? Number(searchParams.get("total") ?? 0);
  const wrongAnswersCount = Math.max(0, totalQuestions - correctAnswersCount);
  const totalScore = 100;
  const earnedPoints = correctAnswersCount;
  const passed = scorePercentage >= (typeof content?.passPercentage === "number" ? content.passPercentage : 50);

  return (
    <div
      className="w-full min-h-screen bg-background flex flex-col items-center py-12 md:py-20 px-4 sm:px-6 md:px-8 font-cairo"
      dir="rtl"
    >
      <main className="flex flex-col items-start justify-center w-full max-w-[960px] flex-1 gap-6 sm:gap-8 mt-[30px]">
        <div className="w-full bg-surface border border-border shadow-[0_8px_24px_rgba(84,70,58,0.06)] rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col items-center gap-8 sm:gap-10 text-center">
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-primary-light flex items-center justify-center text-primary shadow-sm border border-primary-border">
              <Trophy size={28} strokeWidth={2.5} className="sm:w-8 sm:h-8" />
            </div>
            <h1
              className={`font-black text-[20px] sm:text-[24px] md:text-[28px] leading-tight ${passed ? "text-text-main" : "text-danger"}`}
            >
              {passed
                ? "تهانينا، لقد تمكنت من اجتياز الاختبار!"
                : "لم يتسنَّ لك اجتياز الاختبار هذه المرة، واصل المحاولة!"}
            </h1>
            <p className="font-medium text-[14px] sm:text-[15px] text-text-muted max-w-[600px] leading-relaxed">
              {passed
                ? `أظهرت فهماً متميزاً للمقرر الدراسي وأحكامه في (${content.title}). واصل تفوقك وإبداعك.`
                : `لا بأس، يمكنك مراجعة أخطائك وإعادة مشاهدة الدروس لتعزيز فهمك في (${content.title}).`}
            </p>
          </div>
          <div className="relative flex flex-col items-center justify-center w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] my-2">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="80" strokeWidth="12" fill="none" className="stroke-primary-light" />
              <circle
                cx="90"
                cy="90"
                r="80"
                strokeWidth="12"
                fill="none"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - scorePercentage / 100)}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${passed ? "stroke-primary" : "stroke-danger"}`}
              />
            </svg>
            <div className="relative flex flex-col items-center justify-center">
              <span className="font-black text-[32px] sm:text-[40px] text-text-main leading-none mb-1 mt-2">
                {scorePercentage}٪
              </span>
              <span className={`font-bold text-[12px] sm:text-[13px] ${passed ? "text-primary" : "text-danger"}`}>
                درجة الاختبار
              </span>
            </div>
          </div>

          <h3 className="font-bold text-[16px] sm:text-[18px] text-text-main -mt-4">
            درجتك الكلية: {scorePercentage} من {totalScore} درجة
          </h3>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 w-full max-w-[500px]">
            <div className="p-2 flex-1 flex justify-center items-center px-4 sm:px-6 h-[50px] w-full bg-success-bg border border-success rounded-xl gap-2 shadow-sm">
              <CheckCircle2 size={18} className="text-success" />
              <span className="font-bold text-[13px] sm:text-[14px] text-success pt-0.5 text-center">
                الإجابات الصحيحة: {correctAnswersCount}
              </span>
            </div>

            <div className="p-2 flex-1 flex justify-center items-center px-4 sm:px-6 h-[50px] w-full bg-danger-bg border border-danger rounded-xl gap-2 shadow-sm">
              <XCircle size={18} className="text-danger" />
              <span className="font-bold text-[13px] sm:text-[14px] text-danger pt-0.5 text-center">
                الإجابات الخاطئة: {wrongAnswersCount}
              </span>
            </div>
          </div>

          <div className="w-full max-w-[848px] bg-primary-light border border-primary rounded-[16px] p-4 sm:p-5 lg:p-6 flex flex-col items-start gap-2 text-right">
            <div className="flex justify-between items-center w-full flex-wrap gap-2">
              <span className="font-extrabold text-[14px] sm:text-[15px] text-text-main">
                تأثير الاختبار على ترتيبك
              </span>
              <span className="font-bold text-[14px] sm:text-[15px] text-primary">+{earnedPoints} نقطة</span>
            </div>
            <p className="font-medium text-[12px] sm:text-[13px] text-text-muted leading-[22px] sm:leading-[24px]">
              لقد ارتقيت بمقدار مرتبتين إضافيتين في لوحة شرف المتفوقين. واصل همتك!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full pt-4 sm:pt-6 max-w-[640px]">
            <Link
              href={`/educational-content/exam/${contentId}/review`}
              className="p-2 flex-1 w-full h-[52px] sm:h-[56px] bg-primary hover:bg-primary-hover text-footer font-bold text-[14px] sm:text-[15px] rounded-[12px] shadow-[0_8px_16px_rgba(196,154,69,0.14)] transition-all flex items-center justify-center gap-2.5 active:scale-95"
            >
              <Eye size={20} strokeWidth={2.5} />
              <span className="pt-0.5">مراجعة الإجابات والحلول</span>
            </Link>

            <Link
              href="/educational-content"
              className="p-2 flex-1 w-full h-[52px] sm:h-[56px] bg-surface hover:bg-surface-secondary border-2 border-border text-text-main hover:text-primary-hover font-bold text-[14px] sm:text-[15px] rounded-[12px] transition-all flex items-center justify-center gap-2.5 active:scale-95"
            >
              <BookOpen size={20} strokeWidth={2.5} />
              <span className="pt-0.5">العودة للمحتوى التعليمي</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
