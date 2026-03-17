import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { languages } from "@/constants/translations";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="w-full shrink-0 flex items-center justify-between px-8 py-5 bg-zinc-950 border-b border-white/10 relative z-50">
      <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-blue-500 blur-sm opacity-70 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10"></div>
        </div>
        <h1 className="text-xl font-bold tracking-wider text-white drop-shadow-md uppercase flex items-center gap-2">
          <span>
            {t("header.title")}<span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-medium">{t("header.subtitle")}</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[9px] font-black tracking-widest">
            {t("common.beta")}
          </span>
        </h1>
      </Link>

      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/insights"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300"
          >
            {t("nav.insights")}
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300"
          >
            {t("nav.about")}
          </Link>
        </nav>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 hover:bg-white/10 transition-all group pointer-events-auto"
          >
            <span className="text-sm">{currentLang.flag}</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-white transition-colors">
              {currentLang.code}
            </span>
            <svg
              className={`w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-transform duration-300 ${isLangOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
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
              
              <div className="absolute right-0 mt-3 w-48 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto custom-scrollbar">
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
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-xs font-bold tracking-wide">{lang.name}</span>
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
      </div>
    </header>
  );
};

export default Header;
