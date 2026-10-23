import { cookies } from "next/headers";

import { t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";

export default async function Loading() {
  const cookieLocale = (await cookies()).get("locale")?.value;
  const locale: Locale = cookieLocale === "de" ? "de" : "en";
  return (
    <main
      aria-busy="true"
      aria-label={t(locale, "detail.loading.show")}
      className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10"
    >
      <div className="h-8 w-40 animate-pulse rounded-md bg-surface" />
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="aspect-[2/3] w-full max-w-xs animate-pulse rounded bg-surface" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-surface" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
          <div className="h-24 w-full animate-pulse rounded bg-surface" />
          <div className="aspect-video w-full max-w-2xl animate-pulse rounded-lg bg-surface" />
        </div>
      </div>
    </main>
  );
}
