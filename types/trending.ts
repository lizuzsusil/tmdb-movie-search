import type { Movie } from "~/types/movie";

export type TrendingWindow = "day" | "week";

export interface TrendingGridProps {
  movies: Movie[];
  emptyMessage?: string;
  getDetailHref?: (id: number) => string | null;
}
