import { Suspense } from "react";
import { cookies } from "next/headers";

import { SearchBar } from "~/components/SearchBar";
import { SearchSection, SearchSkeleton } from "~/components/SearchResults";
import { t } from "~/lib/i18n";
import { TrendingGrid } from "~/components/TrendingGrid";
import { TrendingWindowToggle } from "~/components/TrendingWindowToggle";
import { getTrendingMovies, getTrendingShows } from "~/lib/api";
import type { Locale } from "~/types/locale";
import type { HomePageProps } from "~/types/routes";
import type { SearchType } from "~/types/search";
import type { TrendingWindow } from "~/types/trending";

// Renders per-request rather than being statically generated at build time,
// during `next build` in CI.
export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const query = (params.query ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const type: SearchType = params.type === "shows" ? "shows" : "movies";
  const window: TrendingWindow = params.window === "day" ? "day" : "week";
  const cookieLocale = (await cookies()).get("locale")?.value;
  const locale: Locale = cookieLocale === "de" ? "de" : "en";

  const trending =
    type === "shows"
      ? await getTrendingShows(window)
      : await getTrendingMovies(window);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Movie Search Case
        </h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </header>

      {query && (
        <a
          href="#search-heading"
          className="sr-only focus:not-sr-only focus:w-fit focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t(locale, "search.skip")}
        </a>
      )}

      {query && (
        <Suspense
          key={`${type}:${query}:${page}`}
          fallback={<SearchSkeleton locale={locale} />}
        >
          <SearchSection
            query={query}
            page={page}
            type={type}
            locale={locale}
          />
        </Suspense>
      )}

      <section
        aria-label={
          type === "shows"
            ? t(locale, "trending.shows")
            : t(locale, "trending.movies")
        }
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-foreground">
            {type === "shows"
              ? t(locale, "trending.shows")
              : t(locale, "trending.movies")}
          </h2>
          <TrendingWindowToggle type={type} window={window} locale={locale} />
        </div>
        <TrendingGrid
          movies={trending}
          emptyMessage={
            type === "shows"
              ? t(locale, "trending.empty.shows")
              : t(locale, "trending.empty.movies")
          }
          getDetailHref={type === "shows" ? (id) => `/shows/${id}` : undefined}
        />
      </section>
    </main>
  );
}
