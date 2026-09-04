"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Check, X } from "lucide-react";
import { getContentById, ContentDetails, ContentQuestion } from "@/lib/api";

export default function AssignmentReviewPage({ params }: { params: Promise<{ contentId: string }> }) {
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    let active = true;

    const fetchContent = async () => {
      try {
        const data = await getContentById(contentId);
        if (active) setContent(data);
      } catch {
        if (active) setContent(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (contentId) {
      try {
        const raw = localStorage.getItem(`ruqi_answers_${contentId}`);
        if (raw) setUserAnswers(JSON.parse(raw));
      } catch {}
      fetchContent();
    }

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
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo" dir="rtl">
        <h3 className="font-extrabold text-[24px] text-danger mb-3">عذراً، المحتوى غير متوفر</h3>
        <Link href="/educational-content" className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-[15px] hover:bg-primary-hover transition-colors flex items-center justify-center">
          العودة للمراحل التعليمية
        </Link>
      </div>
    );
  }

  const questions: ContentQuestion[] = content.homework || [];

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center py-12 md:py-20 px-4 md:px-8 font-cairo" dir="rtl">
      <main className="flex flex-col items-start gap-8 w-full max-w-[880px] flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full bg-surface border border-border shadow-sm rounded-card p-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-black text-[20px] md:text-[24px] text-text-main">
              مراجعة إجابات: {content.title}
            </h1>
            <span className="font-medium text-[14px] text-text-muted">
              راجع أخطائك وتعلم منها لضمان التفوق في التقييمات القادمة.
            </span>
          </div>
          <Link
            href={`/educational-content/content/${contentId}/assignment/result`}
            className="flex items-center justify-center gap-2 h-[48px] px-6 bg-primary-light text-primary-hover hover:bg-primary hover:text-surface font-bold text-[14px] rounded-xl transition-all shrink-0"
          >
            <ArrowRight size={18} />
            <span>العودة للنتيجة</span>
          </Link>
        </div>

        <div className="flex flex-col gap-8 w-full">
          {questions.map((question, qIndex) => {
            const userAnswer = userAnswers[qIndex];
            const isCorrectAnswered = question.correctAnswers.includes(userAnswer);

            return (
              <div key={qIndex} className="w-full bg-surface border border-border shadow-sm rounded-card p-6 md:p-8 flex flex-col gap-6">
                
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <span className="font-extrabold text-[16px] text-text-main flex-1">
                    السؤال {qIndex + 1}:
                  </span>
                  {isCorrectAnswered ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success-bg border border-success/30 rounded-lg text-success font-bold text-[13px]">
                      <CheckCircle2 size={16} />
                      <span>إجابة صحيحة</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-danger-bg border border-danger/30 rounded-lg text-danger font-bold text-[13px]">
                      <XCircle size={16} />
                      <span>إجابة خاطئة</span>
                    </div>
                  )}
                </div>

                <h2 className="font-bold text-[18px] text-text-main leading-relaxed w-full break-words">
                  {question.questionText}
                </h2>

                <div className="flex flex-col gap-3 w-full">
                  {question.options.map((option, optIdx) => {
                    const isUserChoice = userAnswer === optIdx;
                    const isCorrectChoice = question.correctAnswers.includes(optIdx);

                    let optionStyle = "bg-surface border-border text-text-main";
                    let Icon = null;

                    if (isCorrectChoice) {
                      optionStyle = "bg-success-bg border-success text-success font-bold shadow-sm";
                      Icon = <Check size={18} className="text-success" strokeWidth={3} />;
                    } else if (isUserChoice && !isCorrectChoice) {
                      optionStyle = "bg-danger-bg border-danger text-danger font-bold shadow-sm";
                      Icon = <X size={18} className="text-danger" strokeWidth={3} />;
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-start sm:items-center justify-between w-full min-h-[56px] p-4 sm:px-[18px] rounded-xl border-[1.5px] transition-all ${optionStyle}`}
                      >
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          <span className="text-[14px] sm:text-[15px] leading-relaxed break-words flex-1 text-right">
                            {option}
                          </span>
                        </div>
                        {Icon && (
                          <div className="shrink-0 mr-3">
                            {Icon}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}