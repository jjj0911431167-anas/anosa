import { useState, useEffect } from "react";
import { t, getLanguage, setLanguage, isRTL, Language } from "@/lib/i18n";

export function useI18n() {
  const [language, setLanguageState] = useState<Language>(getLanguage());
  const [rtl, setRtl] = useState(isRTL());

  const changeLanguage = async (lang: Language) => {
    await setLanguage(lang);
    setLanguageState(lang);
    setRtl(lang === "ar");
  };

  const translate = (key: string) => t(key, language);

  return {
    language,
    rtl,
    t: translate,
    setLanguage: changeLanguage,
  };
}
