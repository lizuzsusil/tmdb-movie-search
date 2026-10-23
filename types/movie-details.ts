import type { Movie } from "~/types/movie";

export interface MovieDetails extends Movie {
  runtime: number | null;
  tagline: string | null;
  genres: string[];
  trailerKey: string | null;
}
