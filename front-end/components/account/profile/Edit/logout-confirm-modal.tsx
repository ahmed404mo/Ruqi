interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loggingOut: boolean;
}

export default function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
  loggingOut,
}: LogoutConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !loggingOut && onClose()}
    >
      <div
        className="w-full sm:max-w-[440px] bg-surface rounded-t-[20px] sm:rounded-b-[20px] border border-border p-6 md:p-8 shadow-2xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-extrabold text-text-main mb-3 text-center">تسجيل الخروج</h3>
        <p className="text-[14px] text-text-muted text-center leading-relaxed mb-6">
          هل أنت متأكد من تسجيل الخروج من حسابك؟
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loggingOut}
            className="flex-1 h-[48px] bg-transparent border border-border text-text-muted font-bold text-[14px] rounded-xl hover:bg-surface-secondary transition-colors disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loggingOut}
            className="flex-1 h-[48px] bg-danger text-white font-bold text-[14px] rounded-xl hover:bg-danger-hover transition-colors disabled:opacity-60"
          >
            {loggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
          </button>
        </div>
      </div>
    </div>
  );
}