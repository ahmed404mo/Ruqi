import type { Metadata } from "next";
import { Cairo, Aref_Ruqaa } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["700"],
  variable: "--font-aref",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "رقي | منصة الاستاذ سمير ابو المجد",
    template: "%s | رُقِيّ",
  },
  description:
    "رُقِيّ منصة تعليمية عربية متكاملة تهدف إلى تقديم تجربة تعليمية منظمة وفعّالة، من خلال محتوى تعليمي متخصص، دروس واختبارات تفاعلية، ومتابعة مستمرة لمستوى الطلاب وتقدمهم.",
  keywords: [
    "رُقِيّ",
    "منصة رقي",
    "الاستاذ سمير ابو المجد",
    "منصة تعليمية",
    "تعلم اللغة العربية",
    "المرحلة الثانوية",
    "المرحلة المتوسطة",
    "المرحلة الاعدادية",
    "المرحلة الابتدائية",
    "النحو والصرف",
    "البلاغة والنقد",
    "اختبارات تفاعلية",
  ],
  authors: [{ name: "الاستاذ سمير ابو المجد" }],
  robots: "index, follow",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${arefRuqaa.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-text-main font-cairo antialiased selection:bg-primary selection:text-white">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
