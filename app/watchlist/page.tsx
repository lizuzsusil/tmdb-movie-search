import { cookies } from "next/headers";

import { WatchlistView } from "~/components/WatchlistView";
import { t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const cookieLocale = (await cookies()).get("locale")?.value;
  const locale: Locale = cookieLocale === "de" ? "de" : "en";
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {t(locale, "watchlist.title")}
        </h1>
      </header>
      <section aria-label={t(locale, "watchlist.section.label")}>
        <WatchlistView />
      </section>
    </main>
  );
}
