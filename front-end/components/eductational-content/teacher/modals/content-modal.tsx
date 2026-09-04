"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ContentType, ContentQuestion } from "@/lib/api";

interface ContentModalProps {
  open: boolean;
  mode: "create" | "edit";
  type: ContentType;
  initialTitle?: string;
  initialDescription?: string;
  initialVideoUrl?: string;
  initialWrittenExplanation?: string;
  initialPassPercentage?: number;
  initialQuestions?: ContentQuestion[];
  saving?: boolean;
  error?: string | null;
  onSave: (data: {
    title: string;
    description: string;
    videoUrl: string;
    writtenExplanation: string;
    passPercentage: number;
    questions: ContentQuestion[];
  }) => void;
  onClose: () => void;
  onSwitchType?: (type: ContentType) => void;
}

const INPUT_CLASS =
  "w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface";
const TEXTAREA_CLASS =
  "w-full rounded-xl border-[1.5px] border-border px-4 py-3 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface resize-none";

const EMPTY_QUESTION: ContentQuestion = { questionText: "", options: ["", ""], correctAnswers: [] };

export default function ContentModal({
  open,
  mode,
  type,
  initialTitle = "",
  initialDescription = "",
  initialVideoUrl = "",
  initialWrittenExplanation = "",
  initialPassPercentage = 50,
  initialQuestions = [],
  saving = false,
  error = null,
  onSave,
  onClose,
  onSwitchType,
}: ContentModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [writtenExplanation, setWrittenExplanation] = useState(initialWrittenExplanation);
  const [passPercentage, setPassPercentage] = useState(String(initialPassPercentage));
  const [questions, setQuestions] = useState<ContentQuestion[]>(initialQuestions);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setVideoUrl(initialVideoUrl);
      setWrittenExplanation(initialWrittenExplanation);
      setPassPercentage(String(initialPassPercentage));
      setQuestions(initialQuestions.length ? initialQuestions : [EMPTY_QUESTION]);
    }
  }, [open, initialTitle, initialDescription, initialVideoUrl, initialWrittenExplanation, initialPassPercentage, initialQuestions, type]);

  if (!open) return null;

  const handleSwitch = (t: ContentType) => {
    if (onSwitchType) onSwitchType(t);
  };

  const addQuestion = () => {
    setQuestions((q) => [...q, { ...EMPTY_QUESTION }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((q) => q.filter((_, i) => i !== index));
  };

  const setQuestionText = (index: number, value: string) => {
    setQuestions((q) => q.map((item, i) => (i === index ? { ...item, questionText: value } : item)));
  };

  const setOptionText = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((q) =>
      q.map((item, i) =>
        i === qIndex
          ? { ...item, options: item.options.map((o, oi) => (oi === optIndex ? value : o)) }
          : item
      )
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((q) =>
      q.map((item, i) => (i === qIndex ? { ...item, options: [...item.options, ""] } : item))
    );
  };

  const toggleCorrect = (qIndex: number, optIndex: number) => {
    setQuestions((q) =>
      q.map((item, i) => {
        if (i !== qIndex) return item;
        const isSelected = item.correctAnswers[0] === optIndex;
        return { ...item, correctAnswers: isSelected ? [] : [optIndex] };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      writtenExplanation: writtenExplanation.trim(),
      passPercentage: Number(passPercentage) || 50,
      questions,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full sm:max-w-[560px] max-h-[90vh] overflow-y-auto scrollbar-hide bg-surface rounded-t-[20px] sm:rounded-b-[20px] border border-border p-6 md:p-8 shadow-2xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-extrabold text-text-main mb-6 text-center">
          {mode === "create"
            ? type === "LESSON"
              ? "إضافة درس مرئي جديد"
              : "إنشاء اختبار جديد"
            : type === "LESSON"
              ? "تعديل الدرس"
              : "تعديل الاختبار"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Switch type in create mode */}
          {mode === "create" && onSwitchType && (
            <div className="flex gap-2 p-1 bg-surface-secondary rounded-xl">
              <button
                type="button"
                onClick={() => handleSwitch("LESSON")}
                className={`flex-1 h-[42px] rounded-lg font-bold text-[14px] transition-colors ${type === "LESSON" ? "bg-primary text-text-main" : "text-text-muted hover:bg-surface"}`}
              >
                درس مرئي
              </button>
              <button
                type="button"
                onClick={() => handleSwitch("EXAM")}
                className={`flex-1 h-[42px] rounded-lg font-bold text-[14px] transition-colors ${type === "EXAM" ? "bg-primary text-text-main" : "text-text-muted hover:bg-surface"}`}
              >
                اختبار
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">العنوان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={type === "LESSON" ? "مثال: الدرس الأول - التيار الكهربي" : "مثال: امتحان الفصل الأول"}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="شرح مختصر"
              className={TEXTAREA_CLASS}
            />
          </div>

          {type === "LESSON" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">رابط الفيديو (اختياري)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://vimeo.com/123456"
                  className={INPUT_CLASS}
                  dir="ltr"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">الشرح المكتوب (اختياري)</label>
                <textarea
                  value={writtenExplanation}
                  onChange={(e) => setWrittenExplanation(e.target.value)}
                  rows={3}
                  placeholder="الشرح النصي للدرس"
                  className={TEXTAREA_CLASS}
                />
              </div>
            </>
          )}

          {type === "EXAM" && (
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-text-main">نسبة النجاح المطلوبة</label>
              <input
                type="number"
                value={passPercentage}
                onChange={(e) => setPassPercentage(e.target.value)}
                min={0}
                max={100}
                className={INPUT_CLASS}
                dir="ltr"
              />
            </div>
          )}

          {/* Questions: homework for lesson, examQuestions for exam */}
          <div className="flex flex-col gap-3 mt-1">
            <span className="text-[14px] font-bold text-text-main">
              {type === "LESSON" ? "الواجبات (Homework)" : "أسئلة الاختبار"}
            </span>

            {questions.map((q, qi) => (
              <div key={qi} className="border border-border rounded-xl bg-surface-secondary p-4 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <span className="font-extrabold text-[14px] text-primary-hover shrink-0 mt-2.5">{qi + 1}</span>
                  <textarea
                    value={q.questionText}
                    onChange={(e) => setQuestionText(qi, e.target.value)}
                    rows={2}
                    placeholder="نص السؤال..."
                    className={TEXTAREA_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => removeQuestion(qi)}
                    className="shrink-0 mt-2.5 w-9 h-9 rounded-lg bg-danger-bg text-danger hover:bg-danger hover:text-white transition-colors flex items-center justify-center"
                    aria-label="حذف السؤال"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-text-muted">الخيارات</label>
                  <div className="flex flex-col gap-2">
                    {(q.options.length ? q.options : [""]).map((opt, oi) => {
                      const isCorrect = q.correctAnswers[0] === oi;
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCorrect(qi, oi)}
                            title={isCorrect ? "إزالة كإجابة صحيحة" : "تحديد كإجابة صحيحة"}
                            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isCorrect ? "bg-success border-success" : "bg-surface border-border hover:border-primary"
                            }`}
                          >
                            {isCorrect && <span className="w-3 h-3 rounded-full bg-white" />}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => setOptionText(qi, oi, e.target.value)}
                            placeholder={`الخيار ${oi + 1}`}
                            className={`flex-1 h-[42px] rounded-lg border-[1.5px] px-3 text-text-main text-[13px] outline-none transition-colors ${
                              isCorrect ? "border-success bg-success-bg focus:border-success" : "border-border bg-surface focus:border-primary"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => addOption(qi)}
                      className="flex items-center gap-1 text-primary-hover font-bold text-[12px] hover:text-primary transition-colors"
                    >
                      <Plus size={14} />
                      إضافة خيار
                    </button>
                    <p className="text-[11px] text-text-muted">
                      {q.correctAnswers.length === 0
                        ? "حدد الإجابة الصحيحة بالنقر على الدائرة"
                        : "الأخضر = إجابة صحيحة"}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <p className="text-[13px] text-text-muted text-center">لا توجد أسئلة. اضغط "إضافة سؤال" للبدء.</p>
            )}

            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center justify-center gap-1 w-full border-[1.5px] border-dashed border-primary text-primary-hover hover:bg-primary-light font-bold text-[13px] h-[44px] rounded-xl transition-colors"
            >
              <Plus size={16} />
              إضافة سؤال
            </button>
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger-bg border border-danger rounded-lg p-3 text-center font-medium">
              {error}
            </p>
          )}

          <div className="sticky bottom-0 flex gap-3 mt-2 pt-4 pb-1 bg-surface">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-[48px] bg-transparent border border-border text-text-muted font-bold text-[14px] rounded-xl hover:bg-surface-secondary transition-colors disabled:opacity-60"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-[48px] bg-primary text-text-main font-bold text-[14px] rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : mode === "create" ? "إضافة" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
