"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "المحتوى التعليمي", href: "/educational-content" },
  { label: "المتفوقين", href: "/leaderboard" },
  { label: "الحساب", href: "/account" },
  { label: "الدعم", href: "/support" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === "/account" || pathname.startsWith("/account/");
    }
    return pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-surface/60 backdrop-blur-sm border-b border-primary rounded-b-3xl transition-all duration-300 z-1000">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:justify-between">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-text-main p-2 -mr-2"
            aria-label="فتح قائمة التنقل"
            aria-expanded={isMenuOpen}
          >
            <Menu className="rotate-180" size={26} />
          </button>

          <Link
            href="/"
            className="font-aref text-3xl text-primary
                       absolute left-1/2 -translate-x-1/2
                       md:static md:translate-x-0 md:left-auto"
          >
            رُقِيّ
          </Link>

          <ul className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive(link.href) ? "bg-primary text-white" : "text-text-main hover:bg-surface-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="md:hidden w-6.5" aria-hidden="true" />
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-10000 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0" onClick={() => setIsMenuOpen(false)} />

        <div
          className={`absolute inset-y-0 right-0 w-full bg-surface flex flex-col
            transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="font-aref text-2xl text-primary">
                رُقِيّ
              </Link>
            </div>
            <button type="button" onClick={() => setIsMenuOpen(false)} className="p-2" aria-label="إغلاق قائمة التنقل">
              <X size={26} />
            </button>
          </div>

          <ul className="flex flex-col items-center justify-center gap-4 flex-1 px-6 bg-surface rounded-b-3xl shadow-lg py-5">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="w-full">
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full text-center py-4 rounded-full text-lg font-medium transition-colors ${
                    isActive(link.href) ? "bg-primary text-white" : "text-text-main hover:bg-surface-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
