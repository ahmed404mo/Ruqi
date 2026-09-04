"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronUp, Play, Check, Circle } from "lucide-react";
import { ContentItem } from "@/lib/api";

interface MonthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contentList: ContentItem[];
  currentContentId: string;
  currentIndex: number;
  contentPosition: number;
  totalItems: number;
}

export default function MonthDrawer({
  isOpen,
  onClose,
  title,
  contentList,
  currentContentId,
  currentIndex,
  contentPosition,
  totalItems,
}: MonthDrawerProps) {
  const [stage, setStage] = useState<"closed" | "opening" | "open" | "closing">("closed");

  useEffect(() => {
    if (isOpen && stage === "closed") {
      setStage("opening");
    } else if (!isOpen && stage === "open") {
      setStage("closing");
    }
  }, [isOpen, stage]);

  const onTransitionEnd = () => {
    if (stage === "opening") setStage("open");
    if (stage === "closing") setStage("closed");
  };

  const isRendered = stage !== "closed";

  return (
    <div
      className={`fixed inset-0 z-[1100] lg:hidden font-cairo ${isRendered ? "" : "pointer-events-none"}`}
      dir="rtl"
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          stage === "opening" || stage === "open" ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 flex items-end transition-transform duration-300 ease-out ${
          stage === "opening" || stage === "open" ? "translate-y-0" : "translate-y-full"
        }`}
        onTransitionEnd={onTransitionEnd}
      >
        <div className="w-full max-h-[80vh] bg-background border-t border-border rounded-t-[24px] shadow-2xl flex flex-col">
          <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
            <span className="w-12 h-1.5 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-border shrink-0">
            <span className="font-extrabold text-[15px] text-text-main">
              {title}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-control bg-surface border border-border text-text-muted hover:text-text-main transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
            <span className="mb-1 font-bold text-[12px] text-primary px-1">
              الدرس {contentPosition} من {totalItems} في هذا المنهج
            </span>
            {contentList.length === 0 ? (
              <div className="text-center py-6 font-medium text-sm text-text-muted">
                لا توجد عناصر في هذا الشهر بعد.
              </div>
            ) : (
              contentList.map((item, index) => {
                const isCurrent = item._id === currentContentId;
                const isCompleted = currentIndex !== -1 && index < currentIndex;
                const isLessonItem = item.type === "LESSON";
                const href = isLessonItem
                  ? `/educational-content/content/${item._id}`
                  : `/educational-content/exam/${item._id}`;

                return (
                  <Link
                    href={href}
                    key={item._id}
                    onClick={onClose}
                    className={`flex flex-row items-center justify-between p-3.5 rounded-[12px] transition-all duration-200 w-full min-h-[52px] ${
                      isCurrent
                        ? "bg-primary-light border border-primary"
                        : isCompleted
                          ? "bg-transparent border border-primary"
                          : "bg-transparent border border-border"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-[10px] flex items-center justify-center shrink-0 ml-3 ${
                        isCurrent
                          ? "bg-primary text-surface"
                          : isCompleted
                            ? "bg-success-bg text-success"
                            : "bg-surface-secondary text-text-main"
                      }`}
                    >
                      {isCurrent ? (
                        <Play size={10} fill="currentColor" className="ml-0.5" />
                      ) : isCompleted ? (
                        <Check size={12} strokeWidth={3} />
                      ) : (
                        <Circle size={6} fill="currentColor" />
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
        </div>
      </div>
    </div>
  );
}

export function MonthDrawerButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="sticky bottom-4 w-full flex justify-center pointer-events-none lg:hidden mt-auto pt-6 z-[1050] font-cairo" dir="rtl">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto flex flex-row items-center justify-center gap-2.5 px-8 h-[56px] bg-footer rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.3)] border border-border/20 transition-transform active:scale-95"
        aria-label="فتح محتويات الشهر"
      >
        <span className="text-[15px] font-bold text-primary leading-none">
          محتويات الشهر
        </span>
        <ChevronUp size={22} className="text-primary" strokeWidth={2.5} />
      </button>
    </div>
  );
}
