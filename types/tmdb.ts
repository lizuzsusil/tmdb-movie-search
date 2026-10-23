export interface TmdbMovie {
  id: number;
  title: string;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string | null;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMovieDetails extends TmdbMovie {
  runtime?: number | null;
  tagline?: string | null;
  genres?: TmdbGenre[];
  status?: string | null;
}

export interface TmdbShowDetails extends TmdbTvShow {
  tagline?: string | null;
  genres?: TmdbGenre[];
  status?: string | null;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
}

export interface TmdbVideo {
  id: string;
  key: string;
  site: string;
  type: string;
  official?: boolean;
  name?: string;
}

export interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
}

export interface TmdbTvShow {
  id: number;
  name: string;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  first_air_date?: string | null;
}

export interface TmdbPagedResponse<T = TmdbMovie> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
