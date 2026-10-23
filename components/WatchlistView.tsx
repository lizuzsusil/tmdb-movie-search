"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useLocale } from "~/components/LocaleProvider";
import { t } from "~/lib/i18n";
import type { SavedTitle, WatchlistTab } from "~/types/watchlist";
import {
  onSavedChange,
  readSaved,
  toggleSaved,
  updateSaved,
} from "~/lib/store";

export function WatchlistView() {
  const { locale } = useLocale();
  const [entries, setEntries] = useState<SavedTitle[]>([]);
  const [tab, setTab] = useState<WatchlistTab>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(readSaved());
    setMounted(true);
    return onSavedChange(() => setEntries(readSaved()));
  }, []);

  if (!mounted) {
    return <p className="text-sm text-muted">{t(locale, "search.pending")}</p>;
  }

  const visible = entries.filter((e) =>
    tab === "favorites" ? e.favorite : tab === "watched" ? e.watched : true,
  );
  const tabs: { key: WatchlistTab; label: string; count: number }[] = [
    { key: "all", label: t(locale, "watchlist.all"), count: entries.length },
    {
      key: "favorites",
      label: t(locale, "watchlist.favorites"),
      count: entries.filter((e) => e.favorite).length,
    },
    {
      key: "watched",
      label: t(locale, "watchlist.watched"),
      count: entries.filter((e) => e.watched).length,
    },
  ];

  function handleTabKey(event: React.KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const order: WatchlistTab[] = ["all", "favorites", "watched"];
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next =
      order[(order.indexOf(tab) + delta + order.length) % order.length] ??
      "all";
    setTab(next);
    document.getElementById(`watchlist-tab-${next}`)?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label={t(locale, "watchlist.title")}
        tabIndex={-1}
        onKeyDown={handleTabKey}
        className="flex w-fit gap-1 rounded-md border border-border p-1"
      >
        {tabs.map((tb) => (
          <button
            key={tb.key}
            id={`watchlist-tab-${tb.key}`}
            type="button"
            role="tab"
            aria-selected={tab === tb.key}
            tabIndex={tab === tb.key ? 0 : -1}
            onClick={() => setTab(tb.key)}
            className={`rounded px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
              tab === tb.key
                ? "bg-brand-600 text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tb.label} ({tb.count})
          </button>
        ))}
      </div>

      <p role="status" className="sr-only">
        {t(locale, "watchlist.count", { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <p className="text-sm text-muted">{t(locale, "watchlist.empty")}</p>
      ) : (
        <ul
          aria-label={`${tabs.find((tb) => tb.key === tab)?.label} (${visible.length})`}
          className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {visible.map((entry) => {
            const href =
              entry.type === "shows"
                ? `/shows/${entry.id}`
                : `/movies/${entry.id}`;
            return (
              <li
                key={`${entry.type}-${entry.id}`}
                className="flex flex-col gap-1 overflow-hidden rounded-lg border border-border bg-surface"
              >
                <Link
                  href={href}
                  className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
                >
                  <span className="relative block aspect-2/3 w-full bg-background">
                    {entry.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${entry.posterPath}`}
                        alt={`Poster for ${entry.title}`}
                        fill
                        sizes="180px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex h-full items-center justify-center text-xs text-muted"
                      >
                        ○
                      </span>
                    )}
                  </span>
                  <span className="block truncate px-3 pt-2 text-sm font-medium text-foreground">
                    {entry.title}
                  </span>
                </Link>
                <span className="flex flex-wrap items-center gap-1 px-3 pb-3">
                  <button
                    type="button"
                    aria-pressed={!!entry.watched}
                    aria-label={
                      entry.watched
                        ? t(locale, "watchlist.markUnwatched", {
                            title: entry.title,
                          })
                        : t(locale, "watchlist.markWatched", {
                            title: entry.title,
                          })
                    }
                    onClick={() =>
                      setEntries(
                        updateSaved(entry.id, entry.type, {
                          watched: !entry.watched,
                        }),
                      )
                    }
                    title={t(locale, "watchlist.watched")}
                    className={`rounded px-2 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                      entry.watched
                        ? "bg-brand-600 text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span aria-hidden="true">
                      ✓ {t(locale, "watchlist.watched")}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={!!entry.favorite}
                    aria-label={`${t(locale, "watchlist.favorites")}: ${entry.title}`}
                    onClick={() =>
                      setEntries(
                        updateSaved(entry.id, entry.type, {
                          favorite: !entry.favorite,
                        }),
                      )
                    }
                    className={`rounded px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                      entry.favorite
                        ? "text-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span aria-hidden="true">{entry.favorite ? "♥" : "♡"}</span>
                  </button>
                  {entry.rating !== null && entry.rating !== undefined && (
                    <span className="text-xs text-muted">
                      <span aria-hidden="true">★ </span>
                      {entry.rating}/10
                      <span className="sr-only">
                        {" "}
                        rated {entry.rating} out of 10
                      </span>
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={t(locale, "watchlist.remove", {
                      title: entry.title,
                    })}
                    onClick={() =>
                      setEntries(
                        toggleSaved({
                          id: entry.id,
                          title: entry.title,
                          type: entry.type,
                        }),
                      )
                    }
                    className="ml-auto rounded px-2 py-1.5 text-xs text-muted underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                  >
                    ✕<span className="sr-only"> {entry.title}</span>
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
