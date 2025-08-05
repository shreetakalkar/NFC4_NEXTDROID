"use client";

import type React from "react";
import { useState, useEffect, createContext, useContext, useMemo } from "react";
import { translations } from "@/lib/translations";

type SupportedLanguage =
  | "en"
  | "hi"
  | "bn"
  | "te"
  | "mr"
  | "ta"
  | "gu"
  | "kn"
  | "ml"
  | "pa";
type TranslationKey = string;

interface TranslationContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey) => string;
  availableLanguages: SupportedLanguage[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove localStorage usage - use session state only
  const [language, setLanguage] = useState<SupportedLanguage>("en");

  const availableLanguages: SupportedLanguage[] = ["en", "hi"];

  const handleSetLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    // Note: localStorage removed for Claude.ai compatibility
    // In a real app, you might use cookies, server-side storage, or URL params
  };

  // Memoize the translation function for better performance
  const t = useMemo(() => {
    return (key: TranslationKey): string => {
      const keys = key.split(".");
      let value: any = translations[language];

      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) {
          // Log missing translation in development
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `Translation missing for key: ${key} in language: ${language}`
            );
          }

          // Fallback to English if not already using English
          if (language !== "en") {
            let fallbackValue: any = translations.en;
            for (const k of keys) {
              fallbackValue = fallbackValue?.[k];
              if (fallbackValue === undefined) break;
            }
            if (fallbackValue) return fallbackValue;
          }

          // Return the key as last resort
          return key;
        }
      }

      return value || key;
    };
  }, [language]);

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t,
        availableLanguages,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
