"use client";

import { useLocale } from "~/components/LocaleProvider";
import { t } from "~/lib/i18n";
import type { Locale, LocaleOverrideProps } from "~/types/locale";

const OPTIONS: { value: Locale; short: string; labelKey: string }[] = [
  { value: "en", short: "EN", labelKey: "lang.en" },
  { value: "de", short: "DE", labelKey: "lang.de" },
];

export function LanguageSwitcher({
  locale: override,
}: LocaleOverrideProps = {}) {
  const { locale: ctxLocale, setLocale } = useLocale();
  const locale = override ?? ctxLocale;

  function set(next: Locale) {
    if (override !== undefined) {
      document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = next;
    }
    setLocale(next);
  }

  return (
    <div
      role="group"
      aria-label={t(locale, "lang.label")}
      className="flex gap-1 rounded-md border border-border p-1"
    >
      {OPTIONS.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => set(option.value)}
            aria-pressed={active}
            aria-label={`${option.short} – ${t(locale, option.labelKey)}`}
            lang={option.value}
            data-active={active}
            title={t(locale, option.labelKey)}
            className={`rounded px-2 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
              active
                ? "bg-brand-600 text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span aria-hidden="true">{option.short}</span>
          </button>
        );
      })}
    </div>
  );
}
