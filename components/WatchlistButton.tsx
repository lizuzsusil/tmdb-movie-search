"use client";

import { useEffect, useState } from "react";

import { useLocale } from "~/components/LocaleProvider";
import { isSaved, onSavedChange, toggleSaved } from "~/lib/store";

export function WatchlistButton({
  id,
  title,
  type,
  posterPath,
}: {
  id: number;
  title: string;
  type: "movies" | "shows";
  posterPath?: string | null;
}) {
  const { locale } = useLocale();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSaved(id, type));
    return onSavedChange(() => setSaved(isSaved(id, type)));
  }, [id, type]);

  function toggle() {
    const next = toggleSaved({ id, title, type, posterPath });
    setSaved(next.some((e) => e.id === id && e.type === type));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={
        saved
          ? locale === "de"
            ? `${title} von der Merkliste entfernen`
            : `Remove ${title} from watchlist`
          : locale === "de"
            ? `${title} auf die Merkliste setzen`
            : `Save ${title} to watchlist`
      }
      className="w-fit rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <span aria-hidden="true">{saved ? "★ " : "☆ "}</span>
      {saved
        ? locale === "de"
          ? "Gespeichert"
          : "Saved"
        : locale === "de"
          ? "Merkliste"
          : "Watchlist"}
    </button>
  );
}
