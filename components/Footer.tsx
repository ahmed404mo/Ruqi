import Link from "next/link";
import { TvMinimalPlay, BadgeCheck, Send, Crown } from "lucide-react";

const EXPLORE_LINKS = [
  { label: "المحتوى التعليمي", href: "/educational-content" },
  { label: "قائمة المتفوقين", href: "/leaderboard" },
  { label: "حسابك الشخصي", href: "/account" },
  { label: "مركز الدعم والمساعدة", href: "/support" },
];

const SOCIAL_LINKS = [
  { label: "يوتيوب", href: "#", Icon: TvMinimalPlay },
  { label: "فيسبوك", href: "#", Icon: BadgeCheck },
  { label: "واتساب", href: "#", Icon: Send },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
                <Crown size={18} />
              </span>
              <span className="font-aref text-3xl text-primary">رُقِيّ</span>
            </div>
            <p className="text-sm text-footer-foreground/70 max-w-xs">
              منصة رُقِيّ التعليمية المخصصة لتقديم أرقى مستويات علوم اللغة
              العربية بأساليب تفاعلية حديثة.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="font-bold text-lg">استكشف رُقِيّ</h3>
            <ul className="flex flex-col items-center md:items-start gap-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-footer-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="font-bold text-lg">تابع تواصلنا</h3>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/10 hover:bg-primary transition-colors"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
            <p className="text-sm text-footer-foreground/70 max-w-xs">
              يسعدنا الرد على استفساراتكم على مدار الساعة لتقديم الدعم الأمثل.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-footer-foreground/10 flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-sm text-footer-foreground/60">
          <p>حقوق النشر محفوظة © {currentYear} زُقِيّ. صنع بشغف لخدمة الضاد.</p>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              شروط الخدمة
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
