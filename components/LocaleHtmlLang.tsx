"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Sets <html lang> because the root layout cannot read [locale] params. */
export function LocaleHtmlLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale === "ta" ? "ta" : "en";
  }, [locale]);
  return null;
}
