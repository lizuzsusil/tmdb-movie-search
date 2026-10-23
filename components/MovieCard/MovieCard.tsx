import Image from "next/image";
import Link from "next/link";
import { tv } from "tailwind-variants";

import { Rating } from "~/components/Rating";
import type { MovieCardProps } from "~/types/cards";

const card = tv({
  slots: {
    base: "group overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:bg-surface-hover",
    posterWrapper: "relative aspect-[2/3] w-full bg-surface",
    body: "flex flex-col gap-1 p-3",
    title: "line-clamp-1 text-sm font-medium text-foreground",
    meta: "flex items-center gap-2 text-xs text-muted",
  },
});

const { base, posterWrapper, body, title, meta } = card();

export function MovieCard({ movie, href }: MovieCardProps) {
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;

  const card = (
    <article className={base()}>
      <div className={posterWrapper()}>
        {movie.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
            alt={`Poster for ${movie.title}.`}
            fill
            sizes="(min-width: 1280px) 180px, (min-width: 1024px) 200px, (min-width: 768px) 25vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            No poster
          </div>
        )}
      </div>
      <div className={body()}>
        <h3 className={title()}>{movie.title}</h3>
        <div className={meta()}>
          {year && <span>{year}</span>}
          <Rating value={movie.voteAverage} />
        </div>
      </div>
    </article>
  );

  const resolvedHref = href === undefined ? `/movies/${movie.id}` : href;

  if (resolvedHref === null) {
    return card;
  }

  return (
    <Link
      href={resolvedHref}
      aria-label={`${movie.title} — view details`}
      className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      {card}
    </Link>
  );
}
