"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyAccount, resendOtp, getPendingEmail } from "@/lib/api";

const OTP_COOLDOWN_SECONDS = 60; 
const OTP_EXPIRY_SECONDS = 600; 

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? getPendingEmail();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
  const [cooldownLeft, setCooldownLeft] = useState(0); // مؤقت منفصل لإعادة الإرسال

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setCooldownLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const formatTime = (total: number) => {
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleResend = async () => {
    if (cooldownLeft > 0 || loading) return;

    if (!email) {
      setError("بيانات التسجيل غير مكتملة، أعد التسجيل من البداية");
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      await resendOtp(email);
      setSecondsLeft(OTP_EXPIRY_SECONDS); 
      setCooldownLeft(OTP_COOLDOWN_SECONDS); 
      setOtp(["", "", "", "", "", ""]);
      setInfo("تم إعادة إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إعادة إرسال الرمز");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length < 6) {
      setError("الرجاء إدخال رمز التحقق بالكامل");
      return;
    }

    if (!email) {
      setError("بيانات التسجيل غير مكتملة، أعد التسجيل من البداية");
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      await verifyAccount({ email, otp: code });
      router.push("/account/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "الرمز غير صحيح أو منتهي الصلاحية، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden font-cairo">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('/path-to-islamic-pattern.svg')] bg-repeat"></div>

      <div
        className="relative z-10 w-full max-w-[520px] bg-surface rounded-[24px] border border-border p-8 sm:p-10 md:p-12 shadow-[0_16px_48px_-4px_rgba(84,70,58,0.0588)]"
        dir="rtl"
      >
        <div className="flex flex-col items-center justify-center mb-8">
          <svg
            className="w-full max-w-[420px] h-[14px] md:h-[18px] mb-6"
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

          <h1 className="text-[24px] md:text-[28px] font-extrabold text-text-main text-center mb-3">
            تأكيد الحساب
          </h1>
          <p className="text-center text-[14px] md:text-[15px] font-medium text-text-muted leading-relaxed max-w-[360px]">
            قمنا بإرسال رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني، الرجاء إدخاله أدناه.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-8" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-[45px] h-[55px] sm:w-[55px] sm:h-[63px] text-center text-[22px] font-bold rounded-[11.5px] border-[1.5px] bg-surface text-text-main outline-none transition-all
                  ${
                    digit !== ""
                      ? "border-primary shadow-[0_0_0_4px_rgba(196,154,69,0.1)]"
                      : "border-border focus:border-primary"
                  }
                `}
              />
            ))}
          </div>

          <div className="flex items-center justify-center w-full mb-6">
            {secondsLeft > 0 ? (
              <span className="text-text-muted font-medium text-[13px]">
                ينتهي صلاحية الرمز بعد
                <span dir="ltr" className="text-primary-hover font-bold ms-1">
                  {formatTime(secondsLeft)}
                </span>
              </span>
            ) : (
              <span className="text-danger font-medium text-[13px]">انتهت صلاحية الرمز</span>
            )}
          </div>

          {error && (
            <p className="w-full text-[14px] text-danger bg-danger-bg border border-danger/30 rounded-lg p-3 mb-6 text-center font-medium">
              {error}
            </p>
          )}

          {info && (
            <p className="w-full text-[14px] text-success bg-success-bg border border-success/30 rounded-lg p-3 mb-6 text-center font-medium">
              {info}
            </p>
          )}

          {!email && (
            <p className="w-full text-[14px] text-warning bg-warning-bg border border-warning/30 rounded-lg p-3 mb-6 text-center font-medium">
              لم نعثر على بيانات التسجيل.
              <Link href="/account/register" className="text-warning font-bold underline ms-1">
                أعد التسجيل
              </Link>
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otp.join("").length < 6}
            className="w-full h-[58px] bg-primary rounded-[12px] text-text-main font-bold text-[16px] shadow-[0_12px_32px_-4px_rgba(196,154,69,0.1)] hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center mb-6"
          >
            {loading ? "جاري التحقق..." : "تأكيد الرمز"}
          </button>

          <div className="flex items-center gap-1 mt-2">
            <span className="text-text-muted font-medium text-[14px]">
              لم تستلم الرمز؟
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldownLeft > 0} 
              className="text-primary-hover font-bold text-[14px] hover:text-primary transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldownLeft > 0 ? `إعادة الإرسال بعد (${formatTime(cooldownLeft)})` : "إعادة الإرسال"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}