"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getEducationalMonths, getEducationalStageById, EducationalMonth, EducationalStage } from "@/lib/api";

export default function StageMonthsPage({ params }: { params: Promise<{ stageId: string }> }) {
  const resolvedParams = use(params);
  const stageId = resolvedParams.stageId;

  const [stageDetails, setStageDetails] = useState<EducationalStage | null>(null);
  const [months, setMonths] = useState<EducationalMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [stageData, monthsData] = await Promise.all([
          getEducationalStageById(stageId),
          getEducationalMonths(stageId),
        ]);

        if (active) {
          setStageDetails(stageData);
          setMonths(monthsData);
        }
      } catch {
        if (active) {
          setMonths([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (stageId) fetchData();

    return () => {
      active = false;
    };
  }, [stageId]);

  const hasContent = months.length > 0;

  return (
    <div
      className="w-full min-h-screen bg-background flex flex-col items-center overflow-hidden py-20 px-4 md:px-8"
      dir="rtl"
    >
      <main className="flex flex-col items-start px-4 sm:px-2 lg:px-0 gap-8 md:gap-12 w-full max-w-[1200px]">
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex flex-row items-center gap-2 flex-wrap">
            <Link
              href="/educational-content"
              className="font-bold text-[12px] md:text-[14px] text-text-muted hover:text-primary transition-colors"
            >
              المراحل التعليمية
            </Link>
            <span className="text-[12px] md:text-[14px] text-text-muted">&gt;</span>
            {stageDetails ? (
              <span className="font-bold text-[12px] md:text-[14px] text-text-muted">{stageDetails.title}</span>
            ) : (
              <span className="w-16 h-4 bg-border animate-pulse rounded"></span>
            )}
            <span className="text-[12px] md:text-[14px] text-text-muted">&gt;</span>
            <span className="font-bold text-[12px] md:text-[14px] text-primary">الشهور الدراسية</span>
          </div>

          <div className="flex flex-col items-start gap-3 w-full mt-2 md:mt-4">
            <div className="flex flex-row items-center gap-3">
              <div className="w-10 md:w-15 h-px bg-primary"></div>
              <div className="w-3.5 md:w-4.5 h-3.5 md:h-4.5 border-2 border-primary rotate-45"></div>
              <div className="w-10 md:w-15 h-px bg-primary"></div>
            </div>
            <h1 className="font-extrabold text-[28px] md:text-[36px] text-text-main leading-snug md:leading-16.75">
              الشهور الدراسية المتاحة
            </h1>
            <p className="font-medium text-[14px] md:text-[16px] text-text-muted leading-relaxed md:leading-7.5 max-w-164.25">
              اختر الشهر الدراسي للبدء في تصفح الدروس والاختبارات المخصصة لهذه المرحلة وارتقِ بمستواك الأكاديمي
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center w-full py-16 md:py-24">
            <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : hasContent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {months.map((month) => (
              <Link href={`/educational-content/month/${month._id}`} key={month._id} className="block group h-full">
                <div className="flex flex-col w-full h-full bg-surface rounded-card shadow-lg border border-border overflow-hidden cursor-pointer group-hover:scale-[1.02] transition-transform duration-300">
                  <div
                    className="w-full h-[180px] bg-surface-secondary bg-cover bg-center border-b border-border"
                    style={{ backgroundImage: `url('${month.image || "/placeholder-month.jpg"}')` }}
                  ></div>

                  <div className="flex flex-col flex-grow p-5 md:p-6 gap-3">
                    <h3 className="font-extrabold text-[18px] md:text-[20px] text-text-main group-hover:text-primary transition-colors line-clamp-2">
                      {month.title}
                    </h3>
                    <p className="font-medium text-[13px] md:text-[14px] text-text-muted line-clamp-3 leading-relaxed flex-grow">
                      {month.description || "لا يوجد وصف متاح لهذا الشهر."}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <span className="font-bold text-[13px] md:text-[14px] text-text-muted">الاشتراك:</span>
                      <span className="font-extrabold text-[15px] md:text-[16px] text-primary bg-primary-light border border-primary-border px-3 py-1 rounded-lg">
                        {month.price === 0 ? "مجاني" : `${month.price} ج.م`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-16 md:py-24 px-4 sm:px-6 bg-surface border border-border rounded-card text-center shadow-sm">
            <svg
              className="w-16 h-16 md:w-24 md:h-24 text-primary opacity-40 mb-4 md:mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="font-extrabold text-[20px] md:text-[24px] text-text-main mb-2 md:mb-3">
              عذراً، لا يوجد محتوى متاح حالياً
            </h3>
            <p className="font-medium text-[14px] md:text-[16px] text-text-muted max-w-[450px]">
              لم يتم إضافة شهور دراسية لهذه المرحلة بعد. يرجى العودة لاحقاً.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
