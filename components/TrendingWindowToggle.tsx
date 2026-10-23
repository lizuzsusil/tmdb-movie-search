import Link from "next/link";

import { t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";
import type { SearchType } from "~/types/search";
import type { TrendingWindow } from "~/types/trending";

export function TrendingWindowToggle({
  type,
  window,
  locale,
}: {
  type: SearchType;
  window: TrendingWindow;
  locale: Locale;
}) {
  const windows: TrendingWindow[] = ["day", "week"];
  return (
    <div
      role="group"
      aria-label={t(locale, "trending.window.label")}
      className="flex w-fit gap-1 rounded-md border border-border p-1"
    >
      {windows.map((w) => {
        const active = window === w;
        const params = new URLSearchParams({ type, window: w });
        return (
          <Link
            key={w}
            href={`/?${params.toString()}`}
            aria-current={active ? "page" : undefined}
            className={`rounded px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
              active
                ? "bg-brand-600 text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {w === "day"
              ? t(locale, "trending.window.day")
              : t(locale, "trending.window.week")}
          </Link>
        );
      })}
    </div>
  );
}
