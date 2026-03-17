"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language, languages } from "@/constants/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    // Check if savedLang is a valid language
    const isValid = languages.some(l => l.code === savedLang);
    
    if (savedLang && isValid) {
      setLanguageState(savedLang);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as Language;
      const isDetectedValid = languages.some(l => l.code === browserLang);
      
      if (isDetectedValid) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    // Fallback to English if translation for current language doesn't exist
    let current: any = translations[language] || translations["en"];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // If not found in current language, try English
        if (language !== "en") {
          let fallback: any = translations["en"];
          for (const fKey of keys) {
            if (fallback && fallback[fKey] !== undefined) {
              fallback = fallback[fKey];
            } else {
              console.warn(`Translation key not found: ${keyPath}`);
              return keyPath;
            }
          }
          return fallback as string;
        }
        
        console.warn(`Translation key not found: ${keyPath}`);
        return keyPath;
      }
    }

    return current as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
