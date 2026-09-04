export default function Loading() {
  return (
    <section
      aria-label="جاري التحميل"
      className="relative flex h-screen items-center justify-center overflow-hidden px-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="relative h-225 w-225 opacity-40">
          <div className="absolute left-1/2 top-1/2 h-225 w-[320px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[50%] border border-primary-border/30" />

          <div className="absolute left-1/2 top-1/2 h-225 w-[320px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-[50%] border border-primary-border/30" />
        </div>
      </div>

      <div className="relative z-10 flex h-75.5 w-100 flex-col items-center justify-center rounded-card border border-border bg-surface shadow-[0_12px_35px_rgba(45,41,38,0.07)]">
        <span className="font-aref text-[64px] font-bold leading-none text-text-main">
          رُقِيّ
        </span>

        <p className="mt-5 font-cairo text-sm font-medium text-primary">
          جاري تهيئة بيئة التعلم
        </p>

        <div
          aria-label="جاري التحميل"
          role="status"
          className="mt-8 flex h-8 w-8 items-center justify-center"
        >
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary-light border-t-primary" />
        </div>
      </div>
    </section>
  );
}
