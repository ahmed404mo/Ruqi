"use client";

import { useState, useEffect } from "react";

interface MonthModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialTitle?: string;
  initialDescription?: string;
  initialPrice?: number;
  initialImage?: string;
  saving?: boolean;
  error?: string | null;
  onSave: (data: { title: string; description: string; price: number; image: string }) => void;
  onClose: () => void;
}

const INPUT_CLASS =
  "w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface";
const TEXTAREA_CLASS =
  "w-full rounded-xl border-[1.5px] border-border px-4 py-3 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface resize-none";

export default function MonthModal({
  open,
  mode,
  initialTitle = "",
  initialDescription = "",
  initialPrice = 0,
  initialImage = "",
  saving = false,
  error = null,
  onSave,
  onClose,
}: MonthModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState(String(initialPrice));
  const [image, setImage] = useState(initialImage);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setPrice(String(initialPrice));
      setImage(initialImage);
    }
  }, [open, initialTitle, initialDescription, initialPrice, initialImage]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      image: image.trim(),
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
        className="w-full sm:max-w-[480px] bg-surface rounded-t-[20px] sm:rounded-b-[20px] border border-border p-6 md:p-8 shadow-2xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-extrabold text-text-main mb-6 text-center">
          {mode === "create" ? "إنشاء شهر دراسي جديد" : "تعديل الشهر الدراسي"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">اسم الشهر</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="مثال: سبتمبر - الفيزياء الحديثة"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف شهر الدراسة"
              className={TEXTAREA_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">السعر (بالجنيه)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              placeholder="0"
              className={INPUT_CLASS}
              dir="ltr"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">رابط الصورة (اختياري)</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/month.jpg"
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
              {saving ? "جاري الحفظ..." : mode === "create" ? "إنشاء الشهر" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
