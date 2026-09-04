"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Crown,
  Calendar,
  LineChart,
  FileCheck2,
  BookOpenCheck,
  Target,
  Trophy,
  CheckCircle2,
  Star,
  Gift,
  Video,
  ShieldCheck,
  Medal,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Users,
} from "lucide-react";
import {
  getEducationalStages,
  getMonthsByStage,
  getContentByMonth,
} from "@/lib/api";
import Loading from "./loading";

const PLATFORM_FEATURES = [
  {
    icon: Calendar,
    title: "تعلم منظم",
    description: "خطط دراسية محكمة تناسب نمط حياتك اليومي",
  },
  {
    icon: LineChart,
    title: "متابعة مستمرة",
    description: "تقارير دورية تضمن تطور مستواك التعليمي",
  },
  {
    icon: FileCheck2,
    title: "اختبارات تفاعلية",
    description: "قياس حقيقي لقدراتك مع رصد نقاط القوة والضعف",
  },
  {
    icon: BookOpenCheck,
    title: "واجبات وتطبيقات",
    description: "تدريب مستمر يرسخ المفاهيم والمعلومات في الذهن",
  },
  {
    icon: Target,
    title: "تقييم شامل",
    description: "متابعة شاملة ونصائح تساعدك في تسريع تقدمك",
  },
  {
    icon: Trophy,
    title: "منافسة شريفة",
    description: "لوحة متفوقين تحفز همتك للوصول إلى القمة دائمًا",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: "١",
    title: "اختر مرحلتك",
    description: "حدد مستواك الدراسي المناسب",
  },
  {
    number: "٢",
    title: "اختر الشهر",
    description: "اختر الحزمة الشهرية لمناهجك",
  },
  {
    number: "٣",
    title: "ادرس المحتوى",
    description: "شاهد الدروس المسجلة بدقة عالية",
  },
  {
    number: "٤",
    title: "حل الواجبات والاختبارات",
    description: "تطبيق فوري لترسيخ المعرفة",
  },
  {
    number: "٥",
    title: "تابع تقدمك",
    description: "لوحة تحكم ذكية تلخص أداءك",
  },
  {
    number: "٦",
    title: "نافس الطلاب",
    description: "ارتقِ في سلم الترتيب علي مستوي المنصة",
  },
];

const FALLBACK_STATS = [
  { icon: BookOpen, label: "مرحلة تعليمية", value: undefined as number | undefined },
  { icon: GraduationCap, label: "شهر دراسي", value: undefined as number | undefined },
  { icon: ClipboardCheck, label: "درس مسجل", value: undefined as number | undefined },
  { icon: Trophy, label: "اختبار تفاعلي", value: undefined as number | undefined },
];

interface PlatformStats {
  stages: number;
  months: number;
  lessons: number;
  exams: number;
}
const experienceStartYears = 2018;
const experienceYears = new Date().getFullYear() - experienceStartYears;

const TEACHER_HIGHLIGHTS = [
  `خبرة أكثر من ${experienceYears} سنوات في تدريس اللغة العربية`,
  "درّس لأكثر من ٣٠٠٠ طالب",
  "حاصل على ليسانس في اللغة العربية والعلوم الإسلامية من كلية دار العلوم بجامعة القاهرة",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-10 h-px bg-primary-border" />
      <Star size={16} className="text-primary" fill="currentColor" />
      <span className="w-10 h-px bg-primary-border" />
    </div>
  );
}

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
}: {
  value?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView || value === undefined) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, value, duration]);

  if (value === undefined) return null;

  return (
    <p ref={ref} className="text-3xl font-bold text-text-main mb-2">
      {prefix}{displayValue.toLocaleString("ar-EG")}
      {suffix}
    </p>
  );
}

export default function HomePage() {
  const [heroReady, setHeroReady] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    setPageReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stages = await getEducationalStages();
        let months = 0;
        let lessons = 0;
        let exams = 0;
        for (const stage of stages) {
          const stageMonths = await getMonthsByStage(stage._id);
          months += stageMonths.length;
          for (const m of stageMonths) {
            const content = await getContentByMonth(m._id);
            for (const item of content) {
              if (item.type === "LESSON") lessons++;
              else exams++;
            }
          }
        }
        if (!cancelled) setStats({ stages: stages.length, months, lessons, exams });
      } catch {
        if (!cancelled) setStats(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!pageReady) return <Loading />;

  return (
    <>
      {/* ============================================================
          SECTION 1 — Landing Section
          ============================================================ */}
      <section className="relative h-screen flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex-0"></div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          onAnimationComplete={() => setHeroReady(true)}
          className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center"
        >
          <motion.span
            variants={fadeUp}
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-light text-primary"
          >
            <Crown size={28} />
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="font-aref text-6xl sm:text-7xl text-text-main"
          >
            رُقِيّ
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-xl text-primary font-semibold"
          >
            نرتقي باللغة لنرتقي بالعلم
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-text-muted leading-relaxed max-w-xl"
          >
            أول منصة تعليمية عربية مخصصة لرعاية الموهبة العلمية وصقل الهوية
            اللغوية،
            <br />
            عبر مناهج تفاعلية فريدة ومتابعة أكاديمية متميزة.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <Link href="/educational-content" className="btn-primary px-8 py-3">
              مشاهدة المحتوى التعليمي
            </Link>
            <Link href="/account" className="btn-outline px-8 py-3">
              ابدأ رحلتك الآن ←
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={heroReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-2 text-primary animate-bounce pointer-events-none border border-solid border-primary p-2 rounded-2xl mb-2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </section>

      {/* ============================================================
          SECTION 2 — Teacher Spotlight
          ============================================================ */}
      <section className="min-h-screen flex justify-center items-center px-4 sm:px-6 lg:px-8 py-20 bg-surface overflow-hidden">
        <div className="mx-auto max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Teacher Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative w-full aspect-4/5 max-w-sm mx-auto md:mx-0"
          >
            <Image
              src="/images/teacher-image.png"
              alt="الأستاذ سمير محمد أبو المجد"
              fill
              className="object-cover rounded-2xl border border-primary"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <span className="absolute top-4 right-4 bg-surface text-text-main text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              مُعَلِّمُ الْجِيلِ وَالْأَكَادِيمِيُّ الْأَبْرَزُ
            </span>
          </motion.div>

          {/* Teacher info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="text-center md:text-right"
          >
            <p className="text-primary text-sm font-semibold mb-2">
              الهيئة الأكاديمية ل رُقِيّ
            </p>
            <h2 className="text-3xl font-bold text-text-main mb-3">
              الأستاذ سمير محمد أبو المجد
            </h2>
            <p className="text-text-muted mb-4">
              • معلم اللغة العربية الأساسي بالمنصة
            </p>

            <hr className="border-border w-24 mx-auto md:mx-0 mb-6" />

            <p className="text-text-muted leading-relaxed mb-6">
              خبرة تمتد لأكثر من{` ${experienceYears} `}سنوات في توجيه الطلاب
              نحو القمة اللغوية والأكاديمية.
              <br />
              ساهم الأستاذ سمير في صياغة مناهج رُقِيّ الحصرية وتصميم المنهجيات
              التعليمية المتميزة التي تنقل الطالب من التأسيس البسيط إلى مستويات
              الإتقان العالية والبلاغة الفصحى.
            </p>

            <ul className="flex flex-col gap-3 text-right">
              {TEACHER_HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-text-main"
                >
                  <CheckCircle2
                    size={18}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — Platform Features
          ============================================================ */}
      <section className="min-h-screen flex justify-center items-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl w-full text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <SectionDivider />
            <h2 className="text-3xl font-bold text-text-main mb-3">
              مزايا منصة رُقِيّ التعليمية
            </h2>
            <p className="text-text-muted max-w-xl mx-auto mb-12">
              منظومة متكاملة مبنية بعناية لضمان التفوق الدراسي واستعادة عظمة
              البيان العربي
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {PLATFORM_FEATURES.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col items-center gap-3"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary">
                  <Icon size={22} />
                </span>
                <h3 className="font-bold text-text-main">{title}</h3>
                <p className="text-sm text-text-muted max-w-55">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 — How It Works
          ============================================================ */}
      <section className="min-h-screen flex justify-center items-center px-4 sm:px-6 lg:px-8 py-20 bg-surface">
        <div className="mx-auto max-w-6xl w-full text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <SectionDivider />
            <h2 className="text-3xl font-bold text-text-main mb-3">
              كيف تعمل منصة رُقِيّ؟
            </h2>
            <p className="text-text-muted max-w-xl mx-auto mb-12">
              رحلة تعليمية تفاعلية بلمسات تقنية حديثة تبدأ فورًا وتسير بانتظام
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {HOW_IT_WORKS_STEPS.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="ruqi-card p-6 text-center flex flex-col items-center gap-2"
              >
                <span className="text-primary font-bold text-2xl">
                  {step.number}
                </span>
                <h3 className="font-bold text-text-main">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5 — Platform Stats
          ============================================================ */}
      <section className="min-h-screen flex justify-center items-center px-4 sm:px-6 lg:px-8 ">
        <div className="mx-auto max-w-6xl w-full text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <SectionDivider />
            <h2 className="text-3xl lg:text-4xl font-bold text-text-main mb-3">
              إنجازات نفخر بها
            </h2>
            <p className="text-base lg:text-lg text-text-muted max-w-xl mx-auto mb-12">
              جهود حقيقية لتنمية المجتمع التعليمي وصناعة غد لغوي مشرق
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {(stats
              ? [
                  { icon: BookOpen, label: "مرحلة تعليمية", value: stats.stages },
                  { icon: GraduationCap, label: "شهر دراسي", value: stats.months },
                  { icon: ClipboardCheck, label: "درس مسجل", value: stats.lessons },
                  { icon: Trophy, label: "اختبار تفاعلي", value: stats.exams },
                ]
              : FALLBACK_STATS
            ).map(({ icon: Icon, label, value }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="ruqi-card p-6 lg:p-8"
              >
                <span className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary-light text-primary mx-auto mb-4">
                  <Icon size={24} />
                </span>
                {value !== undefined ? (
                   <AnimatedCounter value={value} prefix="+" />
                ) : null}
                <p className="text-sm font-bold lg:text-base text-text-muted">
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
