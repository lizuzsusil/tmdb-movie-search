import { MovieCard } from "~/components/MovieCard";
import type { TrendingGridProps } from "~/types/trending";

export function TrendingGrid({
  movies,
  emptyMessage = "No trending movies right now.",
  getDetailHref,
}: TrendingGridProps) {
  if (movies.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard
            movie={movie}
            href={getDetailHref ? getDetailHref(movie.id) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
