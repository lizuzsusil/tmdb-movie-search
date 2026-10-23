import type { Movie } from "~/types/movie";

export interface CastMember {
  id: number;
  name: string;
  character: string | null;
  profilePath: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  official: boolean;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number | null;
  createdAt: string;
}

export interface MovieFacts {
  status: string | null;
  originalLanguage: string | null;
  budget: number | null;
  revenue: number | null;
  homepage: string | null;
  imdbId: string | null;
  certification: string | null;
}

export interface ShowFacts {
  status: string | null;
  originalLanguage: string | null;
  homepage: string | null;
  contentRating: string | null;
  networks: string[];
  firstAirDate: string | null;
  lastAirDate: string | null;
}

export interface SeasonSummary {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
}

export interface Episode {
  id: number;
  episodeNumber: number;
  name: string;
  overview: string | null;
  airDate: string | null;
  voteAverage: number;
  stillPath: string | null;
}

export interface SeasonDetails extends SeasonSummary {
  overview: string | null;
  episodes: Episode[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  knownFor: string | null;
}

export interface PersonCredit extends Movie {
  mediaType: "movie" | "tv";
  character: string | null;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string | null;
  profile_path?: string | null;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
}

export interface TmdbCreditsResponse {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbReview {
  id: string;
  author?: string;
  content?: string;
  created_at?: string;
  author_details?: { rating?: number | null };
}

export interface TmdbReviewsResponse {
  id: number;
  page: number;
  results: TmdbReview[];
  total_pages: number;
  total_results: number;
}

export interface TmdbReleaseDatesResponse {
  id: number;
  results: {
    iso_3166_1: string;
    release_dates: { certification?: string }[];
  }[];
}

export interface TmdbContentRatingsResponse {
  id: number;
  results: { iso_3166_1: string; rating?: string }[];
}

export interface TmdbSeason {
  season_number: number;
  name?: string;
  episode_count?: number;
  air_date?: string | null;
  poster_path?: string | null;
  overview?: string | null;
  episodes?: {
    id: number;
    episode_number: number;
    name?: string;
    overview?: string | null;
    air_date?: string | null;
    vote_average?: number;
    still_path?: string | null;
  }[];
}

export interface TmdbPerson {
  id: number;
  name: string;
  biography?: string | null;
  birthday?: string | null;
  place_of_birth?: string | null;
  profile_path?: string | null;
  known_for_department?: string | null;
}

export interface TmdbPersonCredits {
  id: number;
  cast: (import("~/types/tmdb").TmdbMovie & {
    media_type?: string;
    character?: string | null;
  })[];
}

export interface TmdbMovieFacts {
  status?: string | null;
  original_language?: string | null;
  budget?: number | null;
  revenue?: number | null;
  homepage?: string | null;
  imdb_id?: string | null;
}

export interface TmdbShowFacts {
  status?: string | null;
  original_language?: string | null;
  homepage?: string | null;
  networks?: { name: string }[];
  first_air_date?: string | null;
  last_air_date?: string | null;
  seasons?: TmdbSeason[];
}
