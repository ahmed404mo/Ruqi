import Link from "next/link";

export default function PlateFormBeforeLogin(){
  return (
  <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden py-20 px-4 md:px-8">
      <div className="absolute inset-0 opacity-5 pointer-events-none flex justify-center items-center"></div>

      <main className="flex flex-col items-center z-10 w-full max-w-7xl gap-12 md:gap-14">
        <div className="flex flex-col items-center text-center gap-3 md:gap-4 w-full">
          <div className="flex flex-row items-center gap-3">
            <div className="w-7.5 md:w-10 h-[1.5px] bg-primary"></div>
            <div className="w-3.5 md:w-4.5 h-3.5 md:h-4.5 border-2 border-primary rotate-45"></div>
            <div className="w-7.5 md:w-10 h-[1.5px] bg-primary"></div>
          </div>
          <h1 className="font-extrabold text-[28px] md:text-[36px] text-text-main leading-snug md:leading-16.75">
            الحساب الشخصي
          </h1>
          <p className="font-medium text-[14px] md:text-[16px] text-text-muted leading-relaxed max-w-125">
            اختر كيف تريد المتابعة في رحلتك معنا
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 w-full max-w-200">
          <div className="flex flex-col items-center text-center p-8 md:p-10 gap-6 w-full md:w-[384px] bg-surface border-[1.5px] border-primary shadow-lg rounded-[20px] transition-transform duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-primary rounded-full flex justify-center items-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-[#1E1A17]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="font-extrabold text-[20px] md:text-[22px] text-text-main">
                إنشاء حساب جديد
              </h2>
              <p className="font-medium text-[14px] text-text-muted leading-[1.6]">
                انضم إلينا كطالب متميز وابدأ فوراً في تصفح المناهج وتلقي الدروس
                واكتساب النقاط.
              </p>
            </div>

            <Link
              href="/account/register"
              className="mt-auto w-full flex justify-center items-center h-13 bg-primary rounded-xl font-semibold text-[15px] text-text-main shadow-[0_12px_32px_-4px_rgba(196,154,69,0.1)] hover:bg-primary-hover transition-colors duration-200"
            >
              سجل كطالب جديد
            </Link>
          </div>

          <div className="flex flex-col items-center text-center p-8 md:p-10 gap-6 w-full md:w-[384px] bg-surface border border-border shadow-lg rounded-[20px] transition-transform duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-primary-light rounded-full flex justify-center items-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-[#997D21]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 19a6 6 0 0 0-12 0" />
                <circle cx="8" cy="9" r="4" />
                <path d="m19 11 3 3v2h-2v-2h-2l-2-2" />
                <circle cx="17" cy="9" r="2" />
              </svg>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-extrabold text-[20px] md:text-[22px] text-text-main">
                تسجيل الدخول
              </h2>
              <p className="font-medium text-[14px] text-text-muted leading-[1.6]">
                لديك حساب بالفعل؟
                <br />
                عد لمتابعة دروسك ومنافسة زملائك.
              </p>
            </div>

            <Link
              href="/account/login"
              className="mt-auto w-full flex justify-center items-center h-13 border-2 border-primary rounded-xl font-semibold text-[15px] text-primary-hover hover:bg-primary hover:text-surface transition-colors duration-200"
            >
              دخول للحساب
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}