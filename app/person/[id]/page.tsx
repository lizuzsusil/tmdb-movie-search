import Image from "next/image";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CardGrid } from "~/components/CardGrid";
import { ShareButton } from "~/components/ShareButton";
import { ApiError, getPerson, getPersonCredits } from "~/lib/api";
import { t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";
import type { PersonPageProps } from "~/types/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id < 1) return { title: "Not found" };
  try {
    const person = await getPerson(id);
    return {
      title: person.name,
      description:
        person.biography?.slice(0, 160) ?? `Details for ${person.name}.`,
    };
  } catch {
    return { title: "Person" };
  }
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }

  let person;
  try {
    person = await getPerson(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
  const credits = await getPersonCredits(id).catch(() => null);

  const cookieLocale = (await cookies()).get("locale")?.value;
  const locale: Locale = cookieLocale === "de" ? "de" : "en";

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <div>
        <ShareButton />
      </div>
      <article className="flex flex-col gap-8 md:flex-row">
        <div className="relative aspect-[2/3] w-full max-w-60 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
          {person.profilePath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${person.profilePath}`}
              alt={`Image of ${person.name}.`}
              fill
              sizes="240px"
              className="object-cover"
              priority
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full items-center justify-center text-4xl text-muted"
            >
              ○
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              {person.name}
            </h1>
            <dl className="flex flex-col gap-1 text-sm">
              {person.knownFor && (
                <div className="flex gap-2">
                  <dt className="text-muted">
                    {t(locale, "person.knownFor")}:
                  </dt>
                  <dd className="text-foreground">{person.knownFor}</dd>
                </div>
              )}
              {person.birthday && (
                <div className="flex gap-2">
                  <dt className="text-muted">{t(locale, "person.born")}:</dt>
                  <dd className="text-foreground">
                    <time dateTime={person.birthday}>{person.birthday}</time>
                    {person.placeOfBirth && ` · ${person.placeOfBirth}`}
                  </dd>
                </div>
              )}
            </dl>
          </header>
          {person.biography && (
            <section aria-labelledby="bio-heading">
              <h2
                id="bio-heading"
                className="mb-1 text-lg font-medium text-foreground"
              >
                {t(locale, "person.biography")}
              </h2>
              <p className="line-clamp-6 text-sm leading-relaxed text-foreground">
                {person.biography}
              </p>
            </section>
          )}
        </div>
      </article>

      {credits && credits.length > 0 && (
        <section
          aria-labelledby="credits-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="credits-heading"
            className="text-lg font-medium text-foreground"
          >
            {t(locale, "person.credits")}
          </h2>
          <CardGrid
            movies={credits}
            getHref={(m) => {
              const credit = credits.find((c) => c.id === m.id);
              return credit?.mediaType === "tv"
                ? `/shows/${m.id}`
                : `/movies/${m.id}`;
            }}
          />
        </section>
      )}
    </main>
  );
}
