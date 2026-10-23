import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { Rating } from "~/components/Rating";
import { ShareButton } from "~/components/ShareButton";
import { WatchlistButton } from "~/components/WatchlistButton";
import {
  CastSection,
  DirectorsLine,
  FactsSection,
  ReviewsSection,
  SimilarSection,
  VideosSection,
} from "~/components/DetailSections";
import {
  ApiError,
  getCredits,
  getMovieDetails,
  getMovieFacts,
  getReviews,
  getSimilar,
  getVideos,
} from "~/lib/api";
import { t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";
import type { MoviePageProps } from "~/types/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id < 1) return { title: "Not found" };
  try {
    const movie = await getMovieDetails(id);
    const year = movie.releaseDate?.slice(0, 4);
    return {
      title: year ? `${movie.title} (${year})` : movie.title,
      description:
        movie.overview ?? movie.tagline ?? `Details for ${movie.title}.`,
      openGraph: {
        title: movie.title,
        description: movie.overview ?? undefined,
        images: movie.posterPath
          ? [`https://image.tmdb.org/t/p/w500${movie.posterPath}`]
          : undefined,
      },
    };
  } catch {
    return { title: "Movie" };
  }
}

function formatRuntime(runtime: number | null): string | null {
  if (!runtime || runtime <= 0) {
    return null;
  }
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatMoney(value: number | null): string | null {
  if (!value) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }

  let movie;
  try {
    movie = await getMovieDetails(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const cookieLocale = (await cookies()).get("locale")?.value;
  const locale: Locale = cookieLocale === "de" ? "de" : "en";

  const [credits, videos, similar, reviews, facts] = await Promise.all([
    getCredits("movies", id).catch(() => null),
    getVideos("movies", id).catch(() => null),
    getSimilar("movies", id).catch(() => null),
    getReviews("movies", id).catch(() => null),
    getMovieFacts(id).catch(() => null),
  ]);

  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;
  const runtime = formatRuntime(movie.runtime);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <Link
        href="/"
        className="w-fit rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        ← Back to search
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <WatchlistButton
          id={movie.id}
          title={movie.title}
          type="movies"
          posterPath={movie.posterPath}
        />
        <ShareButton />
      </div>

      <article className="flex flex-col gap-8 md:flex-row">
        <div className="relative aspect-[2/3] w-full max-w-xs shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
          {movie.posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
              alt={`Poster for ${movie.title}`}
              fill
              sizes="320px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No poster
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-sm text-muted italic">{movie.tagline}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {year && <span>{year}</span>}
              {runtime && <span>{runtime}</span>}
              <Rating value={movie.voteAverage} />
            </div>
            {movie.genres.length > 0 && (
              <ul
                aria-label={t(locale, "detail.genres")}
                className="flex flex-wrap gap-2"
              >
                {movie.genres.map((genre) => (
                  <li
                    key={genre}
                    className="rounded-full border border-border px-3 py-1 text-xs text-foreground"
                  >
                    {genre}
                  </li>
                ))}
              </ul>
            )}
            {credits && <DirectorsLine crew={credits.crew} locale={locale} />}
          </header>

          {movie.overview && (
            <section aria-label="Overview">
              <h2 className="mb-1 text-lg font-medium text-foreground">
                Overview
              </h2>
              <p className="text-sm leading-relaxed text-foreground">
                {movie.overview}
              </p>
            </section>
          )}

          {facts && (
            <FactsSection
              locale={locale}
              facts={[
                [t(locale, "detail.facts.status"), facts.status],
                [
                  t(locale, "detail.facts.language"),
                  facts.originalLanguage?.toUpperCase() ?? null,
                ],
                [t(locale, "detail.facts.budget"), formatMoney(facts.budget)],
                [t(locale, "detail.facts.revenue"), formatMoney(facts.revenue)],
                [t(locale, "detail.facts.certification"), facts.certification],
                [
                  t(locale, "detail.facts.imdb"),
                  facts.imdbId ? (
                    <a
                      href={`https://www.imdb.com/title/${facts.imdbId}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                    >
                      {facts.imdbId}
                    </a>
                  ) : null,
                ],
                [
                  t(locale, "detail.facts.homepage"),
                  facts.homepage ? (
                    <a
                      href={facts.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                    >
                      {t(locale, "detail.facts.homepage")}
                    </a>
                  ) : null,
                ],
              ]}
            />
          )}

        </div>
      </article>

      {credits && <CastSection cast={credits.cast} locale={locale} />}
      {videos && (
        <VideosSection videos={videos} title={movie.title} locale={locale} />
      )}
      {reviews && (
        <ReviewsSection
          reviews={reviews.reviews}
          total={reviews.total}
          locale={locale}
        />
      )}
      {similar && (
        <SimilarSection movies={similar} type="movies" locale={locale} />
      )}
    </main>
  );
}
