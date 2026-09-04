import Link from "next/link";

export default function NotFound() {
  return (
    <section
      aria-label="صفحة غير موجودة"
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

      {/* Not Found Card */}
      <div className="relative z-10 flex w-100 flex-col items-center justify-center rounded-card border border-border bg-surface px-6 py-8 text-center shadow-[0_12px_35px_rgba(45,41,38,0.07)]">
        {/* Logo */}
        <span className="font-aref text-[64px] font-bold leading-none text-text-main">
          رُقِيّ
        </span>

        {/* Error Title & Code */}
        <h1 className="mt-5 font-cairo text-base font-bold text-primary">
          404 - الصفحة غير موجودة
        </h1>

        {/* Description Message */}
        <p className="mt-2 font-cairo text-xs leading-relaxed text-text-main/70">
          عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها.
        </p>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-cairo text-xs font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <span>العودة للرئيسية</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 rotate-180"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
