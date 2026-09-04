"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getEducationalStages, EducationalStage } from "@/lib/api";

export default function ContentPage() {
  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchStages = async () => {
      try {
        const data = await getEducationalStages();
        if (active) {
          setStages(data);
        }
      } catch {
        if (active) {
          setStages([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchStages();

    return () => {
      active = false;
    };
  }, []);

  const hasContent = stages.length > 0;

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center overflow-hidden py-20 px-4 md:px-8">
      <main className="flex flex-col items-start px-4 sm:px-2 lg:px-0 gap-8 md:gap-12 w-full max-w-300">
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex flex-row items-center gap-2 flex-wrap">
            <span className="font-bold text-[12px] md:text-[14px] text-text-muted">
              المحتوى التعليمي
            </span>
            <span className="text-[12px] md:text-[14px] text-text-muted">
              &gt;
            </span>
            <span className="font-bold text-[12px] md:text-[14px] text-primary">
              المراحل التعليمية
            </span>
          </div>

          <div className="flex flex-col items-start gap-3 w-full mt-2 md:mt-4">
            <div className="flex flex-row items-center gap-3">
              <div className="w-10 md:w-15 h-px bg-primary"></div>
              <div className="w-3.5 md:w-4.5 h-3.5 md:h-4.5 border-2 border-primary rotate-45"></div>
              <div className="w-10 md:w-15 h-px bg-primary"></div>
            </div>
            <h1 className="font-extrabold text-[28px] md:text-[36px] text-text-main leading-snug md:leading-16.75">
              المراحل التعليمية المتاحة
            </h1>
            <p className="font-medium text-[14px] md:text-[16px] text-text-muted leading-relaxed md:leading-7.5 max-w-164.25">
              خطط ومسارات دراسية رصينة ومصممة بعناية لمواكبة تطلعاتكم الأكاديمية
              والارتقاء بهويتكم اللغوية
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center w-full py-16 md:py-24">
            <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : hasContent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {stages.map((stage) => (
              <Link href={`/educational-content/stage/${stage._id}`} key={stage._id} className="block">
                <div className="flex flex-col w-full h-85 md:h-95 bg-text-main rounded-card shadow-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                  <div
                    className="w-full grow bg-surface-secondary bg-cover bg-center"
                    style={{ backgroundImage: `url('${stage.image || "/placeholder-stage.jpg"}')` }}
                  ></div>
                  <div className="h-11.25 md:h-12.5 w-full flex justify-center items-center shrink-0">
                    <span className="font-extrabold text-[18px] md:text-[20px] text-primary truncate px-4">
                      {stage.title}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-16 md:py-24 px-4 sm:px-6 md:px-5 bg-surface border border-border rounded-card text-center">
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
            <p className="font-medium text-[14px] md:text-[16px] text-text-muted max-w-112.5">
              نعمل بشغف على إعداد وتجهيز المراحل والمواد التعليمية لنضعها بين
              أيديكم قريباً.
              <br />
              يرجى العودة لاحقاً لاستكشاف المزيد.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}