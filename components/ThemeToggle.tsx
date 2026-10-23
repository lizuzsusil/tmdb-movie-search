"use client";

import { useEffect, useState } from "react";

import { useLocale } from "~/components/LocaleProvider";
import { t } from "~/lib/i18n";
import type { Theme } from "~/types/theme";

function initialTheme(): Theme {
  if (
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "light"
  ) {
    return "light";
  }
  try {
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeToggle() {
  const { locale } = useLocale();
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(initialTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "light"}
      aria-label={t(locale, "theme.label")}
      title={
        theme === "dark" ? t(locale, "theme.light") : t(locale, "theme.dark")
      }
      className="rounded-md border border-border px-2 py-1.5 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
      <span className="sr-only">
        {theme === "dark" ? t(locale, "theme.light") : t(locale, "theme.dark")}
      </span>
    </button>
  );
}
