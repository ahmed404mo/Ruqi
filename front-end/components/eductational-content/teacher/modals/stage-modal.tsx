"use client";

import { useState, useEffect } from "react";

interface StageModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialTitle?: string;
  initialImage?: string;
  saving?: boolean;
  error?: string | null;
  onSave: (data: { title: string; image: string }) => void;
  onClose: () => void;
}

const INPUT_CLASS =
  "w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface";

export default function StageModal({
  open,
  mode,
  initialTitle = "",
  initialImage = "",
  saving = false,
  error = null,
  onSave,
  onClose,
}: StageModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [image, setImage] = useState(initialImage);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setImage(initialImage);
    }
  }, [open, initialTitle, initialImage]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), image: image.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full sm:max-w-[460px] bg-surface rounded-t-[20px] sm:rounded-b-[20px] border border-border p-6 md:p-8 shadow-2xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-extrabold text-text-main mb-6 text-center">
          {mode === "create" ? "إضافة مرحلة دراسية جديدة" : "تعديل المرحلة الدراسية"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">اسم المرحلة</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="مثال: الصف الأول الثانوي"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">رابط الصورة (اختياري)</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/stage.jpg"
              className={INPUT_CLASS}
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger-bg border border-danger rounded-lg p-3 text-center font-medium">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
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
              {saving ? "جاري الحفظ..." : mode === "create" ? "إضافة المرحلة" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
