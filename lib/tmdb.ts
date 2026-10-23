import "server-only";

import type { Movie } from "~/types/movie";
import type { MovieDetails } from "~/types/movie-details";
import type { ShowDetails } from "~/types/show-details";
import type {
  TmdbMovie,
  TmdbMovieDetails,
  TmdbPagedResponse,
  TmdbShowDetails,
  TmdbTvShow,
  TmdbVideo,
  TmdbVideosResponse,
} from "~/types/tmdb";
import type { PagedMovies } from "~/types/search";

const TMDB_BASE_URL =
  process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error(
    "TMDB_API_KEY is not set. Copy .env.example to .env and set a TMDB v4 read access token.",
  );
}

/** Maps our app locale to a TMDB `language` query value (e.g. de → de-DE). */
export function tmdbLanguage(locale: string): string {
  return locale === "de" ? "de-DE" : "en-US";
}

/** Mirrors TmdbMovieMapper.ToDomainModel + MovieMapper.ToApiModel (.NET). */
export function toApiMovie(tmdb: TmdbMovie): Movie {
  const releaseDate =
    tmdb.release_date && /^\d{4}-\d{2}-\d{2}$/.test(tmdb.release_date)
      ? tmdb.release_date
      : null;

  return {
    id: tmdb.id,
    title: tmdb.title,
    overview: tmdb.overview ?? null,
    posterPath: tmdb.poster_path ?? null,
    backdropPath: tmdb.backdrop_path ?? null,
    voteAverage: tmdb.vote_average ?? 0,
    releaseDate,
  };
}

async function tmdbFetch(
  path: string,
  signal?: AbortSignal,
  revalidateSeconds?: number,
) {
  const response = await fetch(`${TMDB_BASE_URL}${path}`, {
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${TMDB_API_KEY}`,
    },
    // Cache TMDB responses at the fetch level so repeated searches and
    // trending loads don't hit TMDB on every request. Search uses a short
    // TTL, trending/details longer ones (passed per call below).
    ...(revalidateSeconds !== undefined
      ? { next: { revalidate: revalidateSeconds } }
      : { cache: "no-store" }),
  });

  if (!response.ok) {
    throw new TmdbUpstreamError(
      `TMDB request to ${path} failed with status ${response.status}`,
      response.status,
    );
  }

  return response;
}

export class TmdbUpstreamError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TmdbUpstreamError";
  }
}

/** Mirrors the planned TmdbClient search: GET search/movie?query=&page=. */
export async function searchTmdb(
  query: string,
  page: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<PagedMovies> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    include_adult: "false",
    language: tmdbLanguage(locale),
  });
  const response = await tmdbFetch(
    `/search/movie?${params.toString()}`,
    signal,
    // Short TTL: search results change rarely but queries vary widely, so a
    // small cache absorbs pagination/back-nav repeats without going stale.
    120,
  );
  const data = (await response.json()) as TmdbPagedResponse;
  return {
    page: data.page,
    results: (data.results ?? []).map(toApiMovie),
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

/** Maps a TMDB TV show onto our Movie card shape (name→title, first_air_date→releaseDate). */
export function toApiShow(tmdb: TmdbTvShow): Movie {
  const releaseDate =
    tmdb.first_air_date && /^\d{4}-\d{2}-\d{2}$/.test(tmdb.first_air_date)
      ? tmdb.first_air_date
      : null;

  return {
    id: tmdb.id,
    title: tmdb.name,
    overview: tmdb.overview ?? null,
    posterPath: tmdb.poster_path ?? null,
    backdropPath: tmdb.backdrop_path ?? null,
    voteAverage: tmdb.vote_average ?? 0,
    releaseDate,
  };
}

/** GET search/tv — same paged envelope as movie search. */
export async function searchShowsTmdb(
  query: string,
  page: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<PagedMovies> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    include_adult: "false",
    language: tmdbLanguage(locale),
  });
  const response = await tmdbFetch(
    `/search/tv?${params.toString()}`,
    signal,
    120,
  );
  const data = (await response.json()) as TmdbPagedResponse<TmdbTvShow>;
  return {
    page: data.page,
    results: (data.results ?? []).map(toApiShow),
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

/** Picks the best YouTube trailer from TMDB's /videos results. */
export function pickTrailerKey(videos: TmdbVideo[]): string | null {
  const youtube = videos.filter((video) => video.site === "YouTube");
  const trailers = youtube.filter((video) => video.type === "Trailer");
  const pool = trailers.length > 0 ? trailers : youtube;
  if (pool.length === 0) {
    return null;
  }
  const official = pool.find((video) => video.official);
  const best = official ?? pool[0];
  return best ? best.key : null;
}

export function toApiMovieDetails(
  tmdb: TmdbMovieDetails,
  videos: TmdbVideo[],
): MovieDetails {
  return {
    ...toApiMovie(tmdb),
    runtime: tmdb.runtime ?? null,
    tagline: tmdb.tagline ?? null,
    genres: (tmdb.genres ?? []).map((genre) => genre.name),
    trailerKey: pickTrailerKey(videos),
  };
}

/** GET /movie/{id} + /movie/{id}/videos (same TMDB token covers both). */
export async function getMovieDetailsFromTmdb(
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<MovieDetails> {
  const language = tmdbLanguage(locale);
  const [detailsResponse, videosResponse] = await Promise.all([
    tmdbFetch(`/movie/${id}?language=${language}`, signal, 3600),
    tmdbFetch(`/movie/${id}/videos?language=${language}`, signal, 3600),
  ]);
  const details = (await detailsResponse.json()) as TmdbMovieDetails;
  const videos = (await videosResponse.json()) as TmdbVideosResponse;
  return toApiMovieDetails(details, videos.results ?? []);
}

/** GET /tv/{id} + /tv/{id}/videos (same TMDB token covers both). */
export async function getShowDetailsFromTmdb(
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<ShowDetails> {
  const language = tmdbLanguage(locale);
  const [detailsResponse, videosResponse] = await Promise.all([
    tmdbFetch(`/tv/${id}?language=${language}`, signal, 3600),
    tmdbFetch(`/tv/${id}/videos?language=${language}`, signal, 3600),
  ]);
  const details = (await detailsResponse.json()) as TmdbShowDetails;
  const videos = (await videosResponse.json()) as TmdbVideosResponse;
  return {
    ...toApiShow(details),
    tagline: details.tagline ?? null,
    genres: (details.genres ?? []).map((genre) => genre.name),
    status: details.status ?? null,
    numberOfSeasons: details.number_of_seasons ?? null,
    numberOfEpisodes: details.number_of_episodes ?? null,
    trailerKey: pickTrailerKey(videos.results ?? []),
  };
}

/** RFC 7807-style error body matching .NET ProblemDetails behavior. */
export function problemJson(
  status: number,
  title: string,
  detail: string,
): Response {
  return Response.json(
    { title, status, detail },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

/* ------------------------------------------------------------------ */
/* Extended catalog + detail fetchers (TMDB discover/credits/etc.)     */
/* ------------------------------------------------------------------ */

import type {
  Episode,
  MovieFacts,
  PersonCredit,
  PersonDetails,
  Review,
  SeasonDetails,
  SeasonSummary,
  ShowFacts,
  TmdbContentRatingsResponse,
  TmdbCreditsResponse,
  TmdbMovieFacts,
  TmdbPerson,
  TmdbPersonCredits,
  TmdbReleaseDatesResponse,
  TmdbReviewsResponse,
  TmdbSeason,
  TmdbShowFacts,
  Video,
} from "~/types/extras";
import type { TrendingWindow } from "~/types/trending";
import type {
  CastMember,
  CrewMember,
  TmdbCastMember,
  TmdbCrewMember,
} from "~/types/extras";

async function tmdbJson<T>(
  path: string,
  signal: AbortSignal | undefined,
  locale: string,
  revalidateSeconds = 3600,
): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const response = await tmdbFetch(
    `${path}${separator}language=${tmdbLanguage(locale)}`,
    signal,
    revalidateSeconds,
  );
  return (await response.json()) as T;
}

/** GET trending with a day/week window. */
export async function getTrendingWindowFromTmdb(
  kind: "movie" | "tv",
  window: TrendingWindow,
  signal?: AbortSignal,
  locale = "en",
): Promise<Movie[]> {
  const data = await tmdbJson<TmdbPagedResponse<TmdbTvShow>>(
    `/trending/${kind}/${window}`,
    signal,
    locale,
    3600,
  );
  const map = kind === "movie" ? toApiMovie : toApiShow;
  return (data.results ?? []).map((item) =>
    map(item as TmdbMovie & TmdbTvShow),
  );
}

function toCastMember(tmdb: TmdbCastMember): CastMember {
  return {
    id: tmdb.id,
    name: tmdb.name,
    character: tmdb.character ?? null,
    profilePath: tmdb.profile_path ?? null,
  };
}

function toCrewMember(tmdb: TmdbCrewMember): CrewMember {
  return {
    id: tmdb.id,
    name: tmdb.name,
    job: tmdb.job ?? "",
    department: tmdb.department ?? "",
  };
}

/** GET /{movie|tv}/{id}/credits. */
export async function getCreditsFromTmdb(
  kind: "movie" | "tv",
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<{ cast: CastMember[]; crew: CrewMember[] }> {
  const data = await tmdbJson<TmdbCreditsResponse>(
    `/${kind}/${id}/credits`,
    signal,
    locale,
    3600,
  );
  return {
    cast: (data.cast ?? []).slice(0, 20).map(toCastMember),
    crew: (data.crew ?? []).slice(0, 20).map(toCrewMember),
  };
}

/** GET /{movie|tv}/{id}/similar — mapped onto card shape with media type. */
export async function getSimilarFromTmdb(
  kind: "movie" | "tv",
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<Movie[]> {
  const data = await tmdbJson<TmdbPagedResponse<TmdbMovie & TmdbTvShow>>(
    `/${kind}/${id}/similar`,
    signal,
    locale,
    3600,
  );
  const map = kind === "movie" ? toApiMovie : toApiShow;
  return (data.results ?? [])
    .slice(0, 12)
    .map((item) => map(item as TmdbMovie & TmdbTvShow));
}

function toVideo(tmdb: TmdbVideo): Video {
  return {
    id: tmdb.id,
    key: tmdb.key,
    name: tmdb.name ?? tmdb.type,
    type: tmdb.type,
    site: tmdb.site,
    official: tmdb.official ?? false,
  };
}

/** GET /{movie|tv}/{id}/videos — all YouTube videos, trailer first. */
export async function getVideosFromTmdb(
  kind: "movie" | "tv",
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<Video[]> {
  const data = await tmdbJson<{ results: TmdbVideo[] }>(
    `/${kind}/${id}/videos`,
    signal,
    locale,
    3600,
  );
  const youtube = (data.results ?? []).filter((v) => v.site === "YouTube");
  youtube.sort((a, b) => {
    const rank = (v: TmdbVideo) =>
      v.type === "Trailer" ? 0 : v.type === "Teaser" ? 1 : 2;
    return rank(a) - rank(b);
  });
  return youtube.slice(0, 6).map(toVideo);
}

/** GET /{movie|tv}/{id}/reviews. */
export async function getReviewsFromTmdb(
  kind: "movie" | "tv",
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<{ reviews: Review[]; total: number }> {
  const data = await tmdbJson<TmdbReviewsResponse>(
    `/${kind}/${id}/reviews`,
    signal,
    locale,
    3600,
  );
  return {
    reviews: (data.results ?? []).slice(0, 5).map((r) => ({
      id: r.id,
      author: r.author ?? "Anonymous",
      content: r.content ?? "",
      rating: r.author_details?.rating ?? null,
      createdAt: r.created_at ?? "",
    })),
    total: data.total_results ?? 0,
  };
}

/** Movie facts: details extras + US/DE release certification. */
export async function getMovieFactsFromTmdb(
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<MovieFacts> {
  const [details, releases] = await Promise.all([
    tmdbJson<TmdbMovieDetails & TmdbMovieFacts>(
      `/movie/${id}`,
      signal,
      locale,
      3600,
    ),
    tmdbJson<TmdbReleaseDatesResponse>(
      `/movie/${id}/release_dates`,
      signal,
      "en",
      86400,
    ),
  ]);
  const region = locale === "de" ? "DE" : "US";
  const entry =
    releases.results?.find((r) => r.iso_3166_1 === region) ??
    releases.results?.find((r) => r.iso_3166_1 === "US");
  const certification =
    entry?.release_dates?.map((r) => r.certification).find(Boolean) ?? null;
  return {
    status: details.status ?? null,
    originalLanguage: details.original_language ?? null,
    budget: details.budget ?? null,
    revenue: details.revenue ?? null,
    homepage: details.homepage ?? null,
    imdbId: details.imdb_id ?? null,
    certification,
  };
}

/** Show facts: details extras + content rating + networks + seasons. */
export async function getShowFactsFromTmdb(
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<{ facts: ShowFacts; seasons: SeasonSummary[] }> {
  const [details, ratings] = await Promise.all([
    tmdbJson<TmdbShowDetails & TmdbShowFacts>(
      `/tv/${id}`,
      signal,
      locale,
      3600,
    ),
    tmdbJson<TmdbContentRatingsResponse>(
      `/tv/${id}/content_ratings`,
      signal,
      "en",
      86400,
    ),
  ]);
  const region = locale === "de" ? "DE" : "US";
  const contentRating =
    ratings.results?.find((r) => r.iso_3166_1 === region)?.rating ??
    ratings.results?.find((r) => r.iso_3166_1 === "US")?.rating ??
    null;
  const toSeason = (s: TmdbSeason): SeasonSummary => ({
    seasonNumber: s.season_number,
    name: s.name ?? `Season ${s.season_number}`,
    episodeCount: s.episode_count ?? 0,
    airDate: s.air_date ?? null,
    posterPath: s.poster_path ?? null,
  });
  return {
    facts: {
      status: details.status ?? null,
      originalLanguage: details.original_language ?? null,
      homepage: details.homepage ?? null,
      contentRating,
      networks: (details.networks ?? []).map((n) => n.name),
      firstAirDate: details.first_air_date ?? null,
      lastAirDate: details.last_air_date ?? null,
    },
    seasons: (details.seasons ?? [])
      .filter((s) => s.season_number >= 0)
      .map(toSeason),
  };
}

/** GET /tv/{id}/season/{n} with episodes. */
export async function getSeasonFromTmdb(
  id: number,
  season: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<SeasonDetails> {
  const data = await tmdbJson<TmdbSeason>(
    `/tv/${id}/season/${season}`,
    signal,
    locale,
    3600,
  );
  return {
    seasonNumber: data.season_number,
    name: data.name ?? `Season ${data.season_number}`,
    episodeCount: data.episodes?.length ?? data.episode_count ?? 0,
    airDate: data.air_date ?? null,
    posterPath: data.poster_path ?? null,
    overview: data.overview ?? null,
    episodes: (data.episodes ?? []).map((e): Episode => ({
      id: e.id,
      episodeNumber: e.episode_number,
      name: e.name ?? `Episode ${e.episode_number}`,
      overview: e.overview ?? null,
      airDate: e.air_date ?? null,
      voteAverage: e.vote_average ?? 0,
      stillPath: e.still_path ?? null,
    })),
  };
}

/** GET /person/{id}. */
export async function getPersonFromTmdb(
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<PersonDetails> {
  const data = await tmdbJson<TmdbPerson>(
    `/person/${id}`,
    signal,
    locale,
    3600,
  );
  return {
    id: data.id,
    name: data.name,
    biography: data.biography ?? null,
    birthday: data.birthday ?? null,
    placeOfBirth: data.place_of_birth ?? null,
    profilePath: data.profile_path ?? null,
    knownFor: data.known_for_department ?? null,
  };
}

/** GET /person/{id}/combined_credits — filmography on card shape. */
export async function getPersonCreditsFromTmdb(
  id: number,
  signal?: AbortSignal,
  locale = "en",
): Promise<PersonCredit[]> {
  const data = await tmdbJson<TmdbPersonCredits>(
    `/person/${id}/combined_credits`,
    signal,
    locale,
    3600,
  );
  return (data.cast ?? [])
    .filter((c) => c.media_type === "movie" || c.media_type === "tv")
    .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
    .slice(0, 18)
    .map((c): PersonCredit => {
      const base: Movie =
        c.media_type === "tv"
          ? toApiShow(c as unknown as TmdbTvShow)
          : toApiMovie(c);
      return {
        ...base,
        mediaType: c.media_type as "movie" | "tv",
        character: c.character ?? null,
      };
    });
}
