import { evaluatePassword, getPasswordStrength, PASSWORD_STRENGTH_LABELS, PasswordStrengthLevel } from "@/lib/password";
import { useState } from "react";

export default function PasswordField({
  label,
  showStrength,
  value,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; showStrength?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  const password = typeof value === "string" ? value : Array.isArray(value) ? value.join("") : String(value ?? "");

  const checks = evaluatePassword(password);
  const level = getPasswordStrength(password);

  const LEVEL_COLORS: Record<PasswordStrengthLevel, string> = {
    1: "#ba1a1a",
    2: "#d97706",
    3: "#2e7d32",
    4: "#2e7d32",
  };

  const levelColor = LEVEL_COLORS[level];
  const successColor = "#2e7d32";
  const trackColor = "#e2ddd5";
  const mutedColor = "#736c65";
  const complexEnough = checks.caseMix && checks.number && checks.special;
const INPUT_CLASS =
  "w-full h-[52px] rounded-xl border-[1.5px] border-border bg-surface px-4 text-text-main placeholder-text-muted focus:border-primary outline-none text-[14px] md:text-[15px] transition-all text-right";

  return (
    <div className="block mb-6">
      <label>
        <span className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">{label}</span>
        <div className="relative">
          <input type={showPassword ? "text" : "password"} className={`${INPUT_CLASS} pl-14`} dir="rtl" {...props} />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 left-4 my-auto h-fit text-[12px] md:text-[13px] font-semibold text-primary-hover hover:text-primary transition-colors"
          >
            {showPassword ? "إخفاء" : "عرض"}
          </button>
        </div>
      </label>

      {showStrength && (
        <div className="flex flex-col gap-[6px] mt-3">
          <div className="flex justify-between items-center w-full" dir="rtl">
            <span className="text-text-muted font-medium text-[11px] md:text-[12px]">مستوى أمان كلمة المرور</span>
            <span className="font-bold text-[11px] md:text-[12px] transition-colors" style={{ color: levelColor }}>
              {PASSWORD_STRENGTH_LABELS[level]}
            </span>
          </div>
          <div className="flex flex-row-reverse gap-1 w-full h-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-full flex-1 rounded-full transition-colors"
                style={{ backgroundColor: i <= level ? levelColor : trackColor }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-1 mt-1 text-right" dir="rtl">
            <span
              className="text-[10px] md:text-[11px] font-medium transition-colors leading-relaxed"
              style={{ color: checks.minLength ? successColor : mutedColor }}
            >
              • يجب أن تحتوي على ٨ أحرف على الأقل
            </span>
            <span
              className="text-[10px] md:text-[11px] font-medium transition-colors leading-relaxed"
              style={{ color: complexEnough ? successColor : mutedColor }}
            >
              • يجب أن تتضمن حرفاً كبيراً وصغيراً ورقمية ورمزاً خاصاً مثل (#, @, $)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}