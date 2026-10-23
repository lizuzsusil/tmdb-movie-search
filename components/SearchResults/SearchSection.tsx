import Link from "next/link";

import { searchByType } from "~/lib/api";
import { t } from "~/lib/i18n";
import type { SearchSectionProps, SearchType } from "~/types/search";
import { SearchResults } from "./SearchResults";

function retryHref(query: string, page: number, type: SearchType): string {
  const params = new URLSearchParams({ query, page: String(page), type });
  return `/?${params.toString()}`;
}

export async function SearchSection({
  query,
  page,
  type,
  locale = "en",
}: SearchSectionProps) {
  let results;
  try {
    results = await searchByType(type, query, page);
  } catch {
    return (
      <section role="alert" className="flex flex-col items-start gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {t(locale, "results.error.title", { query })}
        </h2>
        <p className="text-sm text-muted">{t(locale, "results.error.body")}</p>
        <Link
          href={retryHref(query, page, type)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          {t(locale, "results.retry")}
        </Link>
      </section>
    );
  }

  if (results.results.length === 0) {
    return (
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium text-foreground">
          {t(locale, "results.error.title", { query })}
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
    <SearchResults
      query={query}
      results={results}
      type={type}
      locale={locale}
    />
  );
}
