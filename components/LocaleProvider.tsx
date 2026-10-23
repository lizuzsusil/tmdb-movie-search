"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { STRINGS } from "~/lib/i18n";
import type { Locale, LocaleContextValue } from "~/types/locale";

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  strings: STRINGS.en,
});

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = next;
      router.refresh();
    },
    [router],
  );

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, strings: STRINGS[locale] ?? STRINGS.en }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
