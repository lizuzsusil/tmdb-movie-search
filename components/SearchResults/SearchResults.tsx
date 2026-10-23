import Link from "next/link";

import { Announcer } from "~/components/Announcer";
import { MovieCard } from "~/components/MovieCard";
import { PageFocus } from "~/components/PageFocus";
import { t } from "~/lib/i18n";
import type { SearchResultsProps, SearchType } from "~/types/search";

function pageHref(query: string, page: number, type: SearchType): string {
  const params = new URLSearchParams({ query, page: String(page), type });
  return `/?${params.toString()}`;
}

export function SearchResults({
  query,
  results,
  type,
  locale = "en",
}: SearchResultsProps) {
  const { page, totalPages, totalResults } = results;

  if (results.results.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-foreground">
          {t(locale, "results.heading", { query, count: 0 })}
        </h2>
        <p role="status" className="text-sm text-muted">
          {t(
            locale,
            type === "shows" ? "results.empty.shows" : "results.empty.movies",
            { query },
          )}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={t(locale, "results.section.label", { query })}
      className="flex flex-col gap-4"
    >
      <Announcer
        message={t(locale, "results.announcer", { count: totalResults, query })}
      />
      <PageFocus
        targetId="search-heading"
        changeKey={`${type}:${query}:${page}`}
      />
      <h2
        className="text-lg font-medium text-foreground"
        tabIndex={-1}
        id="search-heading"
      >
        {t(locale, "results.heading", { query, count: totalResults })}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {results.results.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            href={type === "shows" ? `/shows/${movie.id}` : undefined}
          />
        ))}
      </div>
      <nav
        aria-label={t(locale, "pager.label")}
        className="flex items-center gap-3"
      >
        {page > 1 ? (
          <Link
            href={pageHref(query, page - 1, type)}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            {t(locale, "pager.prev")}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="cursor-not-allowed rounded-md border border-border px-3 py-1.5 text-sm text-muted opacity-50"
          >
            {t(locale, "pager.prev")}
          </span>
        )}
        <span aria-current="page" className="text-sm text-muted">
          {t(locale, "pager.status", { page, total: totalPages })}
        </span>
        {page < totalPages ? (
          <Link
            href={pageHref(query, page + 1, type)}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            {t(locale, "pager.next")}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="cursor-not-allowed rounded-md border border-border px-3 py-1.5 text-sm text-muted opacity-50"
          >
            {t(locale, "pager.next")}
          </span>
        )}
      </nav>
    </section>
  );
}
