import type { Movie } from "~/types/movie";

export interface CardGridProps {
  movies: Movie[];
  getHref?: (movie: Movie) => string | null;
  emptyMessage?: string;
  label?: string;
}

export interface MovieCardProps {
  movie: Movie;
  href?: string | null;
}
