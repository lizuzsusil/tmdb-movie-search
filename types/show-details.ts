import type { Movie } from "~/types/movie";

export interface ShowDetails extends Movie {
  tagline: string | null;
  genres: string[];
  status: string | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  trailerKey: string | null;
}
