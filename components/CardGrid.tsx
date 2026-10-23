import { MovieCard } from "~/components/MovieCard";
import type { CardGridProps } from "~/types/cards";

export function CardGrid({
  movies,
  getHref,
  emptyMessage,
  label,
}: CardGridProps) {
  if (movies.length === 0) {
    return (
      <p className="text-sm text-muted">
        {emptyMessage ?? "Nothing here yet."}
      </p>
    );
  }
  return (
    <ul
      aria-label={label}
      className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
    >
      {movies.map((movie, id) => (
        <li key={`${movie.id}-${id}`}>
          <MovieCard
            movie={movie}
            href={getHref ? getHref(movie) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
