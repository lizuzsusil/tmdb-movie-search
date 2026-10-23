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
  FactsSection,
  ReviewsSection,
  SeasonsSection,
  SimilarSection,
  VideosSection,
} from "~/components/DetailSections";
import {
  ApiError,
  getCredits,
  getReviews,
  getSeason,
  getShowDetails,
  getShowFacts,
  getSimilar,
  getVideos,
} from "~/lib/api";
import { t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";
import type { ShowPageProps } from "~/types/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ShowPageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id < 1) return { title: "Not found" };
  try {
    const show = await getShowDetails(id);
    const year = show.releaseDate?.slice(0, 4);
    return {
      title: year ? `${show.title} (${year})` : show.title,
      description:
        show.overview ?? show.tagline ?? `Details for ${show.title}.`,
      openGraph: {
        title: show.title,
        description: show.overview ?? undefined,
        images: show.posterPath
          ? [`https://image.tmdb.org/t/p/w500${show.posterPath}`]
          : undefined,
      },
    };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function ShowPage({
  params,
  searchParams,
}: ShowPageProps) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }

  let show;
  try {
    show = await getShowDetails(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const cookieLocale = (await cookies()).get("locale")?.value;
  const locale: Locale = cookieLocale === "de" ? "de" : "en";

  const [credits, videos, similar, reviews, factsResult] = await Promise.all([
    getCredits("shows", id).catch(() => null),
    getVideos("shows", id).catch(() => null),
    getSimilar("shows", id).catch(() => null),
    getReviews("shows", id).catch(() => null),
    getShowFacts(id).catch(() => null),
  ]);

  const year = show.releaseDate ? show.releaseDate.slice(0, 4) : null;
  const seasons = factsResult?.seasons ?? [];
  const requestedSeason = Number.parseInt(
    (await searchParams)?.season ?? "",
    10,
  );
  const activeSeasonNumber = Number.isInteger(requestedSeason)
    ? requestedSeason
    : (seasons.find((s) => s.seasonNumber > 0)?.seasonNumber ??
      seasons[0]?.seasonNumber ??
      null);
  const activeSeason =
    activeSeasonNumber !== null
      ? await getSeason(id, activeSeasonNumber).catch(() => null)
      : null;

  const meta: string[] = [];
  if (factsResult?.facts.status) {
    meta.push(factsResult.facts.status);
  }
  if (show.numberOfSeasons !== null) {
    meta.push(
      `${show.numberOfSeasons} season${show.numberOfSeasons === 1 ? "" : "s"}`,
    );
  }
  if (show.numberOfEpisodes !== null) {
    meta.push(
      `${show.numberOfEpisodes} episode${show.numberOfEpisodes === 1 ? "" : "s"}`,
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <Link
        href="/?type=shows"
        className="w-fit rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        ← Back to search
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <WatchlistButton
          id={show.id}
          title={show.title}
          type="shows"
          posterPath={show.posterPath}
        />
        <ShareButton />
      </div>

      <article className="flex flex-col gap-8 md:flex-row">
        <div className="relative aspect-[2/3] w-full max-w-xs shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
          {show.posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${show.posterPath}`}
              alt={`Poster for ${show.title}`}
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
              {show.title}
            </h1>
            {show.tagline && (
              <p className="text-sm text-muted italic">{show.tagline}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {year && <span>{year}</span>}
              {meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
              <Rating value={show.voteAverage} />
            </div>
            {show.genres.length > 0 && (
              <ul
                aria-label={t(locale, "detail.genres")}
                className="flex flex-wrap gap-2"
              >
                {show.genres.map((genre) => (
                  <li
                    key={genre}
                    className="rounded-full border border-border px-3 py-1 text-xs text-foreground"
                  >
                    {genre}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {show.overview && (
            <section aria-label="Overview">
              <h2 className="mb-1 text-lg font-medium text-foreground">
                Overview
              </h2>
              <p className="text-sm leading-relaxed text-foreground">
                {show.overview}
              </p>
            </section>
          )}

          {factsResult && (
            <FactsSection
              locale={locale}
              facts={[
                [t(locale, "detail.facts.status"), factsResult.facts.status],
                [
                  t(locale, "detail.facts.language"),
                  factsResult.facts.originalLanguage?.toUpperCase() ?? null,
                ],
                [
                  t(locale, "detail.facts.contentRating"),
                  factsResult.facts.contentRating,
                ],
                [
                  t(locale, "detail.facts.networks"),
                  factsResult.facts.networks.length > 0
                    ? factsResult.facts.networks.join(", ")
                    : null,
                ],
                [
                  t(locale, "detail.facts.homepage"),
                  factsResult.facts.homepage ? (
                    <a
                      href={factsResult.facts.homepage}
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
      <SeasonsSection
        showId={show.id}
        seasons={seasons}
        active={activeSeason}
        locale={locale}
      />
      {videos && (
        <VideosSection videos={videos} title={show.title} locale={locale} />
      )}
      {reviews && (
        <ReviewsSection
          reviews={reviews.reviews}
          total={reviews.total}
          locale={locale}
        />
      )}
      {similar && (
        <SimilarSection movies={similar} type="shows" locale={locale} />
      )}
    </main>
  );
}
