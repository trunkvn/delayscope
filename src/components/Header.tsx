import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { languages } from "@/constants/translations";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentLang =
    languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="w-full shrink-0 flex items-center justify-between px-4 md:px-8 py-4 md:py-5 bg-background border-b border-border-theme relative z-50 transition-colors duration-500">
      <Link
        href="/"
        className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity"
      >
        <div className="relative flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
          <div className="absolute inset-0 rounded-full bg-blue-500 blur-sm opacity-50 animate-pulse"></div>
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-foreground shadow-[0_0_15px_rgba(var(--foreground),0.8)] relative z-10 transition-colors"></div>
        </div>
        <h1 className="text-lg md:text-xl font-bold tracking-wider text-foreground drop-shadow-md uppercase flex items-center gap-2 transition-colors">
          <span className="truncate max-w-30 md:max-w-none">
            {t("header.title")}
            <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-medium">
              {t("header.subtitle")}
            </span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[8px] md:text-[9px] font-black tracking-widest">
            {t("common.beta")}
          </span>
        </h1>
      </Link>

      <div className="flex items-center gap-4 md:gap-8">
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/insights"
            className="text-sm font-medium text-muted-theme hover:text-foreground transition-all duration-300"
          >
            {t("nav.insights")}
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-theme hover:text-foreground transition-all duration-300"
          >
            {t("nav.about")}
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-theme hover:text-foreground transition-all duration-300"
          >
            {t("nav.contact")}
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-theme hover:text-foreground transition-all duration-300 flex items-center gap-2 group"
          >
            {t("nav.getApp")}
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] font-black tracking-widest uppercase group-hover:bg-amber-500/20 transition-all">
              {t("common.comingSoon")}
            </span>
          </Link>
        </nav>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 bg-card border border-border-theme rounded-full px-3 md:px-4 py-1.5 hover:bg-white/10 transition-all group pointer-events-auto"
          >
            <span className="text-sm">{currentLang.flag}</span>
            <span className="hidden xs:inline text-[10px] font-bold text-muted-theme uppercase tracking-widest group-hover:text-foreground transition-colors">
              {currentLang.code}
            </span>
            <svg
              className={`w-3 h-3 text-muted-theme group-hover:text-blue-400 transition-transform duration-300 ${isLangOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isLangOpen && (
            <>
              {/* Click-out barrier */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsLangOpen(false)}
              ></div>

              <div className="absolute right-0 mt-3 w-48 bg-card backdrop-blur-2xl border border-border-theme rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-1 max-h-75 overflow-y-auto custom-scrollbar">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl transition-all ${
                        language === lang.code
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-muted-theme hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-xs font-bold tracking-wide">
                          {lang.name}
                        </span>
                      </div>
                      {language === lang.code && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <div
            className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
          ></div>
          <div
            className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
          ></div>
          <div
            className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          ></div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-18.25 bg-background z-50 md:hidden animate-in slide-in-from-right duration-300 p-8 flex flex-col gap-8 border-t border-border-theme transition-colors">
          <nav className="flex flex-col gap-6">
            <Link
              href="/insights"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-black text-foreground uppercase tracking-tighter"
            >
              {t("nav.insights")}
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-black text-foreground uppercase tracking-tighter"
            >
              {t("nav.about")}
            </Link>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3"
            >
              {t("nav.getApp")}
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-500 text-[10px] font-black tracking-widest uppercase">
                {t("common.comingSoon")}
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
