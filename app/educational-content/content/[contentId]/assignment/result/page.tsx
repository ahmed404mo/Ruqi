"use client";

import { Suspense } from "react";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { getContentById, ContentDetails } from "@/lib/api";

export default function AssignmentResultPage({ params }: { params: Promise<{ contentId: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full min-h-screen bg-background">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AssignmentResultInner params={params} />
    </Suspense>
  );
}

function AssignmentResultInner({ params }: { params: Promise<{ contentId: string }> }) {
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;
  const searchParams = useSearchParams();

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchResult = async () => {
      try {
        const data = await getContentById(contentId);
        if (active) {
          setContent(data);
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

    if (contentId) fetchResult();

    return () => {
      active = false;
    };
  }, [contentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex pt-10 flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo" dir="rtl">
        <h3 className="font-extrabold text-[24px] text-danger mb-3">عذراً، النتيجة غير متوفرة</h3>
        <Link href="/educational-content" className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-[15px] hover:bg-primary-hover transition-colors flex items-center justify-center">
          العودة للمراحل التعليمية
        </Link>
      </div>
    );
  }

  const scorePercentage = Number(searchParams.get("score") ?? 0);
  const correctAnswersCount = Number(searchParams.get("correct") ?? 0);
  const totalCount = Number(searchParams.get("total") ?? 0);
  const wrongAnswersCount = Math.max(0, totalCount - correctAnswersCount);
  const totalScore = 100;
  const earnedPoints = correctAnswersCount;

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center py-10 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8 font-cairo" dir="rtl">
      <main className="flex flex-col items-center justify-center w-full max-w-[960px] flex-1 mt-[30px]">
        
        <div className="w-full pt-20 bg-surface border border-border shadow-[0_8px_24px_rgba(84,70,58,0.06)] rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col items-center gap-8 sm:gap-10 text-center">
          
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-primary-light flex items-center justify-center text-primary shadow-sm border border-primary-border">
              <Trophy size={28} strokeWidth={2.5} className="sm:w-8 sm:h-8" />
            </div>
            <h1 className="font-black text-[20px] sm:text-[24px] md:text-[28px] text-text-main leading-tight">
              تهانينا، لقد تمكنت من اجتياز الواجب بنجاح!
            </h1>
            <p className="font-medium text-[14px] sm:text-[15px] text-text-muted max-w-[600px] leading-relaxed">
              أظهرت فهماً متميزاً لأحكام الدرس والتطبيقات الخاصة به. واصل تفوقك وإبداعك.
            </p>
          </div>

          <div className="relative flex flex-col items-center justify-center w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] my-2">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r="80"
                stroke="#faf5ea"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="90"
                cy="90"
                r="80"
                stroke="#c49a45"
                strokeWidth="12"
                fill="none"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - scorePercentage / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="relative flex flex-col items-center justify-center">
              <span className="font-black text-[32px] sm:text-[40px] text-text-main leading-none mb-1 mt-2">
                {scorePercentage}٪
              </span>
              <span className="font-bold text-[12px] sm:text-[13px] text-primary">
                درجة التقييم
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
                تأثير التطبيق على ترتيبك
              </span>
              <span className="font-bold text-[14px] sm:text-[15px] text-primary">
                +{earnedPoints} نقطة
              </span>
            </div>
            <p className="font-medium text-[12px] sm:text-[13px] text-text-muted leading-[22px] sm:leading-[24px]">
              لقد ارتقيت بمقدار مرتبتين إضافيتين في لوحة شرف المتفوقين. واصل همتك!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full pt-2 sm:pt-4 max-w-[600px]">
            <Link
              href={`/educational-content/content/${contentId}/assignment/review/`}
              className="p-2 flex-1 w-full h-[52px] sm:h-[56px] bg-primary hover:bg-primary-hover text-[#1E1A17] font-bold text-[14px] sm:text-[15px] rounded-xl shadow-[0_8px_16px_rgba(196,154,69,0.14)] transition-colors flex items-center justify-center"
            >
              مراجعة الإجابات والحلول
            </Link>
            
            <Link
              href={`/educational-content/content/${contentId}`}
              className="p-2 flex-1 w-full h-[52px] sm:h-[56px] bg-surface hover:bg-surface-secondary border-[1.5px] border-border text-text-main font-bold text-[14px] sm:text-[15px] rounded-xl transition-colors flex items-center justify-center"
            >
              العودة للدرس المرئي
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}
