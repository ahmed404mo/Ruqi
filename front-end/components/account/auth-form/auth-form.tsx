"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  loginUser,
  signup,
  savePendingEmail,
  getPendingEmail,
  saveTokens,
  NotVerifiedError,
  getEducationalStages,
  EducationalStage,
} from "@/lib/api";
import PasswordField from "./password-field";

type Mode = "login" | "register";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  stage: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  address: "",
  stage: "",
};

const INPUT_CLASS =
  "w-full h-[52px] rounded-xl border-[1.5px] border-border bg-surface px-4 text-text-main placeholder-text-muted outline-none text-[14px] md:text-[15px] transition-all text-right";

function FormField({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: boolean }) {
  return (
    <div className="block mb-5">
      <label className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">{label}</label>
      <input
        className={`${INPUT_CLASS} ${error ? "border-danger" : "border-border focus:border-primary"}`}
        dir="rtl"
        {...props}
      />
    </div>
  );
}

export default function AuthForm({ mode: initialMode }: { mode: Mode }) {
  const router = useRouter();
  const isLogin = initialMode === "login";

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(false);

  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);

  useEffect(() => {
    if (!isLogin) {
      setLoadingStages(true);
      getEducationalStages()
        .then((data) => setStages(data))
        .catch(() => setError("تعذر تحميل المراحل الدراسية، تأكد من اتصال الخادم"))
        .finally(() => setLoadingStages(false));
    }
  }, [isLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email" && emailError) setEmailError(false);
    if (error) setError(null);
    if (needsActivation) setNeedsActivation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.includes("@")) {
      setEmailError(true);
      return;
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (!isLogin && !form.stage) {
      setError("من فضلك اختر المرحلة الدراسية أولاً");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { tokens } = await loginUser({ email: form.email, password: form.password });
        saveTokens(tokens);
        router.push("/account/profile");
      } else {
        await signup({
          name: form.name,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber,
          address: form.address,
          stage: form.stage,
        });
        savePendingEmail(form.email);
        router.push(`/account/verify-email?email=${form.email}`);
      }
    } catch (err) {
      if (err instanceof NotVerifiedError) {
        setNeedsActivation(true);
      } else {
        setError(err instanceof Error ? err.message : "حدث خطأ أثناء المعالجة");
      }
    } finally {
      setLoading(false);
    }
  };

  const activationPendingEmail = getPendingEmail();

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden font-cairo ${
        isLogin ? "py-8 sm:py-12 md:py-20" : "py-20"
      }`}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('/path-to-islamic-pattern.svg')] bg-repeat"></div>

      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-full bg-surface rounded-[20px] md:rounded-[24px] border border-border shadow-[0_16px_48px_-4px_rgba(84,70,58,0.0588)] p-6 sm:p-8 md:p-12 transition-all ${
          isLogin ? "max-w-[520px]" : "max-w-[600px]"
        }`}
        dir="rtl"
      >
        <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
          <svg
            className="w-full max-w-[504px] h-[14px] md:h-[18px] mb-3"
            viewBox="0 0 504 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="171" y="8.5" width="60" height="1" fill="#D4AF37" />
            <path
              d="M251.792 1.55918C251.729 1.59826 251.678 1.65416 251.645 1.72056L249.913 5.22981C249.799 5.46101 249.63 5.661 249.422 5.81255C249.213 5.9641 248.971 6.06268 248.716 6.09981L244.842 6.66606C244.768 6.67648 244.699 6.7074 244.642 6.7553C244.585 6.80319 244.542 6.86613 244.519 6.93695C244.496 7.00777 244.494 7.08362 244.512 7.15587C244.53 7.22811 244.568 7.29383 244.621 7.34556L247.423 10.0733C247.608 10.2534 247.747 10.4758 247.827 10.7213C247.906 10.9669 247.925 11.2281 247.882 11.4826L247.221 15.3368C247.208 15.4101 247.216 15.4855 247.244 15.5545C247.272 15.6235 247.318 15.6832 247.379 15.727C247.439 15.7707 247.51 15.7967 247.584 15.802C247.658 15.8073 247.733 15.7916 247.798 15.7568L251.261 13.9358C251.489 13.816 251.743 13.7534 252.001 13.7534C252.259 13.7534 252.513 13.816 252.741 13.9358L256.204 15.7568C256.27 15.7918 256.344 15.8077 256.419 15.8025C256.493 15.7973 256.564 15.7713 256.625 15.7276C256.685 15.6838 256.732 15.6239 256.76 15.5548C256.788 15.4857 256.796 15.4102 256.783 15.3368L256.121 11.4818C256.078 11.2275 256.097 10.9664 256.176 10.721C256.256 10.4757 256.395 10.2534 256.579 10.0733L259.381 7.34481C259.434 7.29302 259.472 7.22741 259.49 7.15539C259.508 7.08336 259.505 7.00781 259.482 6.93726C259.459 6.86672 259.417 6.804 259.36 6.75621C259.303 6.70841 259.234 6.67745 259.161 6.66681L255.286 6.09981C255.031 6.06239 254.789 5.96368 254.581 5.81215C254.373 5.66062 254.204 5.46079 254.09 5.22981L252.358 1.72056C252.325 1.65416 252.274 1.59826 252.211 1.55918C252.148 1.5201 252.075 1.49939 252.001 1.49939C251.927 1.49939 251.855 1.5201 251.792 1.55918Z"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="273" y="8.5" width="60" height="1" fill="#D4AF37" />
          </svg>

          <h1 className="text-[24px] md:text-[28px] font-extrabold text-text-main text-center mb-1">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </h1>
          <p className="text-center text-[13px] md:text-[14px] font-medium text-text-muted">
            {isLogin
              ? "مرحباً بك مجدداً في محراب العلم والمعرفة"
              : "انضم إلى نخبة الطلاب في منصة التعليم العربية الأرقى"}
          </p>
        </div>

        {!isLogin && (
          <FormField
            label="الاسم الكامل"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="أدخل اسمك الثلاثي"
          />
        )}

        <FormField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder={isLogin ? "yourGmail@gmail.com" : "example@gmail.com"}
          error={emailError}
        />
        {emailError && (
          <p className="text-danger text-[12px] font-semibold -mt-4 mb-5 text-right">
            البريد الإلكتروني المدخل غير صحيح، يرجى التحقق من الصيغة.
          </p>
        )}

        <PasswordField
          label="كلمة المرور"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder={isLogin ? "ادخل كلمة السر" : "*******"}
          showStrength={!isLogin}
        />

        {isLogin && (
          <div className="mb-6 text-left -mt-3">
            <Link
              href="/account/forgot-password"
              className="text-primary-hover font-semibold text-[13px] md:text-[14px] hover:text-primary transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
        )}

        {!isLogin && (
          <PasswordField
            label="تأكيد كلمة المرور"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            placeholder="أعد كتابة كلمة المرور للتأكيد"
          />
        )}

        {!isLogin && (
          <>
            <FormField
              label="رقم الهاتف"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              placeholder="01xxxxxxxx"
            />
            <FormField
              label="العنوان"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="مثال: دمنهور"
            />

            <div className="block mb-5">
              <label className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">
                المرحلة الدراسية
              </label>
              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                required
                className={`${INPUT_CLASS} border-border focus:border-primary appearance-none cursor-pointer`}
                dir="rtl"
              >
                <option value="" disabled>
                  {loadingStages ? "جاري تحميل المراحل..." : "اختر المرحلة الدراسية"}
                </option>
                {stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {error && !emailError && (
          <p className="text-sm text-danger bg-danger-bg border border-danger/30 rounded-lg p-3 mb-6 text-center font-medium">
            {error}
          </p>
        )}

        {needsActivation && (
          <p className="text-sm text-danger bg-danger-bg border border-danger/30 rounded-lg p-3 mb-6 text-center font-medium">
            لم يتم تفعيل حسابك بعد.
            <Link
              href={
                activationPendingEmail ? `/account/verify-email?email=${activationPendingEmail}` : "/account/register"
              }
              className="text-danger font-bold underline ms-1 hover:text-primary transition-colors"
            >
              تفعيل الحساب
            </Link>
          </p>
        )}

        <div className="flex flex-col items-center gap-5 mt-2">
          <button
            type="submit"
            disabled={loading || (!isLogin && loadingStages)}
            className="w-full h-[52px] md:h-[58px] bg-primary rounded-xl text-text-main font-bold text-[15px] md:text-[16px] shadow-[0_12px_32px_-4px_rgba(196,154,69,0.1)] hover:bg-primary-hover disabled:opacity-60 transition-colors flex items-center justify-center"
          >
            {loading ? (isLogin ? "جاري الدخول..." : "جاري الإنشاء...") : isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}
          </button>

          <div className="flex items-center gap-1">
            <span className="text-text-muted font-medium text-[13px] md:text-[14px]">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            </span>
            <Link
              href={isLogin ? "/account/register" : "/account/login"}
              className="text-primary-hover font-bold text-[13px] md:text-[14px] hover:text-primary transition-colors"
            >
              {isLogin ? "أنشئ حساباً الآن" : "سجل دخولك الآن"}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
