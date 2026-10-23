import "server-only";

import { cookies } from "next/headers";

import type { Movie } from "~/types/movie";
import type { MovieDetails } from "~/types/movie-details";
import type { ShowDetails } from "~/types/show-details";
import type {
  CastMember,
  CrewMember,
  MovieFacts,
  PersonCredit,
  PersonDetails,
  Review,
  SeasonDetails,
  SeasonSummary,
  ShowFacts,
  Video,
} from "~/types/extras";
import type { TrendingWindow } from "~/types/trending";
import type { ApiFetchOptions } from "~/types/api";
import type { PagedMovies, SearchType } from "~/types/search";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and point it at the running API.",
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiFetch<T>(path: string, init?: ApiFetchOptions): Promise<T> {
  const { retries = 2, ...fetchInit } = init ?? {};
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchInit,
      headers: { Accept: "application/json", ...fetchInit?.headers },
    });

    if (response.ok) {
      return (await response.json()) as T;
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < retries) {
      lastError = new ApiError(
        `Request to ${path} failed with status ${response.status}`,
        response.status,
      );
      const retryAfter = Number(response.headers.get("retry-after"));
      const delay = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : 300 * 2 ** attempt;
      await sleep(Math.min(delay, 3000));
      continue;
    }

    throw new ApiError(
      `Request to ${path} failed with status ${response.status}`,
      response.status,
    );
  }

  throw lastError instanceof Error
    ? lastError
    : new ApiError(`Request to ${path} failed`, 500);
}
async function currentLocale(): Promise<string> {
  const cookieLocale = (await cookies()).get("locale")?.value;
  return cookieLocale === "de" ? "de" : "en";
}

export async function getTrendingMovies(
  window: TrendingWindow = "week",
): Promise<Movie[]> {
  const params = new URLSearchParams({
    language: await currentLocale(),
    window,
  });
  return apiFetch<Movie[]>(`/movies/trending?${params.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function getTrendingShows(
  window: TrendingWindow = "week",
): Promise<Movie[]> {
  const params = new URLSearchParams({
    language: await currentLocale(),
    window,
  });
  return apiFetch<Movie[]>(`/shows/trending?${params.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const params = new URLSearchParams({ language: await currentLocale() });
  return apiFetch<MovieDetails>(`/movies/${id}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function getShowDetails(id: number): Promise<ShowDetails> {
  const params = new URLSearchParams({ language: await currentLocale() });
  return apiFetch<ShowDetails>(`/shows/${id}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function searchMovies(
  query: string,
  page = 1,
): Promise<PagedMovies> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    language: await currentLocale(),
  });
  return apiFetch<PagedMovies>(`/movies/search?${params.toString()}`, {
    cache: "no-store",
  });
}

export async function searchShows(
  query: string,
  page = 1,
): Promise<PagedMovies> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    language: await currentLocale(),
  });
  return apiFetch<PagedMovies>(`/shows/search?${params.toString()}`, {
    cache: "no-store",
  });
}

export function searchByType(
  type: SearchType,
  query: string,
  page = 1,
): Promise<PagedMovies> {
  return type === "shows"
    ? searchShows(query, page)
    : searchMovies(query, page);
}

async function detailExtra<T>(
  base: string,
  id: number,
  extra: string,
): Promise<T> {
  const params = new URLSearchParams({ language: await currentLocale() });
  return apiFetch<T>(`/${base}/${id}/${extra}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export function getCredits(
  type: SearchType,
  id: number,
): Promise<{ cast: CastMember[]; crew: CrewMember[] }> {
  return detailExtra(type === "shows" ? "shows" : "movies", id, "credits");
}

export function getSimilar(type: SearchType, id: number): Promise<Movie[]> {
  return detailExtra(type === "shows" ? "shows" : "movies", id, "similar");
}

export function getVideos(type: SearchType, id: number): Promise<Video[]> {
  return detailExtra(type === "shows" ? "shows" : "movies", id, "videos");
}

export function getReviews(
  type: SearchType,
  id: number,
): Promise<{ reviews: Review[]; total: number }> {
  return detailExtra(type === "shows" ? "shows" : "movies", id, "reviews");
}

export function getMovieFacts(id: number): Promise<MovieFacts> {
  return detailExtra("movies", id, "facts");
}

export function getShowFacts(
  id: number,
): Promise<{ facts: ShowFacts; seasons: SeasonSummary[] }> {
  return detailExtra("shows", id, "facts");
}

export async function getSeason(
  id: number,
  season: number,
): Promise<SeasonDetails> {
  const params = new URLSearchParams({ language: await currentLocale() });
  return apiFetch<SeasonDetails>(
    `/shows/${id}/seasons/${season}?${params.toString()}`,
    {
      next: { revalidate: 3600 },
    },
  );
}

export async function getPerson(id: number): Promise<PersonDetails> {
  const params = new URLSearchParams({ language: await currentLocale() });
  return apiFetch<PersonDetails>(`/people/${id}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function getPersonCredits(id: number): Promise<PersonCredit[]> {
  const params = new URLSearchParams({ language: await currentLocale() });
  return apiFetch<PersonCredit[]>(
    `/people/${id}/credits?${params.toString()}`,
    {
      next: { revalidate: 3600 },
    },
  );
}
