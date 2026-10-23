import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { CardGrid } from "~/components/CardGrid";
import { t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";
import type {
  CastMember,
  CrewMember,
  Episode,
  Review,
  SeasonDetails,
  SeasonSummary,
  Video,
} from "~/types/extras";
import type { Movie } from "~/types/movie";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-lg font-medium text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CastSection({
  cast,
  locale,
}: {
  cast: CastMember[];
  locale: Locale;
}) {
  if (cast.length === 0) return null;
  return (
    <Section id="cast" title={t(locale, "detail.cast")}>
      <ul className="grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-4 md:grid-cols-5">
        {cast.slice(0, 10).map((person) => (
          <li key={person.id}>
            <Link
              href={`/person/${person.id}`}
              className={`flex flex-col gap-1 rounded-lg border border-border bg-surface p-2 hover:bg-surface-hover ${focusRing}`}
            >
              <span className="relative block aspect-square w-full overflow-hidden rounded-md bg-background">
                {person.profilePath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${person.profilePath}`}
                    alt={`Image of ${person.name}.`}
                    fill
                    sizes="150px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-full items-center justify-center text-lg text-muted"
                  >
                    ○
                  </span>
                )}
              </span>
              <span className="line-clamp-1 text-xs font-medium text-foreground">
                {person.name}
              </span>
              {person.character && (
                <span className="line-clamp-1 text-xs text-muted">
                  {t(locale, "detail.as")} {person.character}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function DirectorsLine({
  crew,
  locale,
}: {
  crew: CrewMember[];
  locale: Locale;
}) {
  const directors = crew.filter((c) => c.job === "Director").slice(0, 3);
  if (directors.length === 0) return null;
  return (
    <p className="text-sm text-muted">
      {t(locale, "detail.directedBy")}:{" "}
      {directors.map((d, i) => (
        <span key={d.id}>
          {i > 0 && ", "}
          <Link
            href={`/person/${d.id}`}
            className={`text-foreground underline ${focusRing}`}
          >
            {d.name}
          </Link>
        </span>
      ))}
    </p>
  );
}

export function VideosSection({
  videos,
  title,
  locale,
}: {
  videos: Video[];
  title: string;
  locale: Locale;
}) {
  if (videos.length === 0) return null;
  const [first, ...rest] = videos;
  return (
    <Section id="videos" title={t(locale, "detail.videos")}>
      {first && (
        <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border">
          <iframe
            src={`https://www.youtube.com/embed/${first.key}`}
            title={`${first.name} — ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}
      {rest.length > 0 && (
        <ul className="flex list-none flex-col gap-1 p-0">
          {rest.map((video) => (
            <li key={video.id}>
              <a
                href={`https://www.youtube.com/watch?v=${video.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm text-foreground underline ${focusRing}`}
              >
                {video.name}
                <span className="text-muted"> ({video.type})</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export function SimilarSection({
  movies,
  type,
  locale,
}: {
  movies: Movie[];
  type: "movies" | "shows";
  locale: Locale;
}) {
  if (movies.length === 0) return null;
  return (
    <Section
      id="similar"
      title={t(
        locale,
        type === "shows" ? "detail.similar.shows" : "detail.similar.movies",
      )}
    >
      <CardGrid
        movies={movies.slice(0, 6)}
        getHref={(m) =>
          type === "shows" ? `/shows/${m.id}` : `/movies/${m.id}`
        }
      />
    </Section>
  );
}

export function ReviewsSection({
  reviews,
  total,
  locale,
}: {
  reviews: Review[];
  total: number;
  locale: Locale;
}) {
  if (reviews.length === 0) {
    return (
      <Section id="reviews" title={t(locale, "detail.reviews")}>
        <p className="text-sm text-muted">
          {t(locale, "detail.reviews.empty")}
        </p>
      </Section>
    );
  }
  return (
    <Section
      id="reviews"
      title={`${t(locale, "detail.reviews")} (${t(locale, "detail.reviews.count", { count: total })})`}
    >
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4"
          >
            <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
              <span className="font-medium text-foreground">
                {review.author}
              </span>
              {review.rating !== null && (
                <span className="text-muted">
                  <span aria-hidden="true">★ </span>
                  {review.rating.toFixed(1)}
                  <span className="sr-only"> out of 10</span>
                </span>
              )}
              {review.createdAt && (
                <time
                  dateTime={review.createdAt}
                  className="text-xs text-muted"
                >
                  {review.createdAt.slice(0, 10)}
                </time>
              )}
            </header>
            <p className="line-clamp-4 text-sm leading-relaxed text-foreground">
              {review.content}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function FactsSection({
  facts,
  locale,
}: {
  facts: [string, ReactNode][];
  locale: Locale;
}) {
  const rows = facts.filter(
    ([, v]) => v !== null && v !== "" && v !== undefined,
  );
  if (rows.length === 0) return null;
  return (
    <Section id="facts" title={t(locale, "detail.facts")}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-muted">{term}</dt>
            <dd className="text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function SeasonsSection({
  showId,
  seasons,
  active,
  locale,
}: {
  showId: number;
  seasons: SeasonSummary[];
  active: SeasonDetails | null;
  locale: Locale;
}) {
  if (seasons.length === 0) return null;
  return (
    <Section id="seasons" title={t(locale, "detail.seasons")}>
      <nav
        aria-label={t(locale, "detail.seasons")}
        className="flex flex-wrap gap-2"
      >
        {seasons.map((s) => {
          const isActive = active?.seasonNumber === s.seasonNumber;
          return (
            <Link
              key={s.seasonNumber}
              href={`/shows/${showId}?season=${s.seasonNumber}`}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-md border border-border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-foreground hover:bg-surface-hover"
              }`}
            >
              {s.name}
              <span className="sr-only"> ({s.episodeCount})</span>
            </Link>
          );
        })}
      </nav>
      {active && <EpisodeList season={active} locale={locale} />}
    </Section>
  );
}

function EpisodeList({
  season,
  locale,
}: {
  season: SeasonDetails;
  locale: Locale;
}) {
  if (season.episodes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-foreground">
        {season.name} · {t(locale, "detail.episodes")}: {season.episodeCount}
      </h3>
      <ol className="flex list-none flex-col gap-3 p-0">
        {season.episodes.map((ep: Episode) => (
          <li
            key={ep.id}
            className="flex gap-3 rounded-lg border border-border bg-surface p-3"
          >
            {ep.stillPath ? (
              <span className="relative block aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-background">
                <Image
                  src={`https://image.tmdb.org/t/p/w300${ep.stillPath}`}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                  loading="lazy"
                />
              </span>
            ) : null}
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                <span className="text-muted">
                  {t(locale, "detail.episode.label", { n: ep.episodeNumber })}{" "}
                  ·{" "}
                </span>
                {ep.name}
              </p>
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                {ep.airDate && <time dateTime={ep.airDate}>{ep.airDate}</time>}
                {ep.voteAverage > 0 && (
                  <span>
                    <span aria-hidden="true">★ </span>
                    {ep.voteAverage.toFixed(1)}
                    <span className="sr-only"> out of 10</span>
                  </span>
                )}
              </p>
              {ep.overview && (
                <p className="line-clamp-2 text-xs leading-relaxed text-muted">
                  {ep.overview}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
