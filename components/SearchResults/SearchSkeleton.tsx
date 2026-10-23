import { t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";

export function SearchSkeleton({ locale = "en" }: { locale?: Locale }) {
  return (
    <section
      aria-busy="true"
      aria-label={t(locale, "skeleton.label")}
      className="flex flex-col gap-4"
    >
      <div className="h-6 w-56 animate-pulse rounded bg-surface" />
      <p role="status" className="text-sm text-muted">
        {t(locale, "skeleton.status")}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[2/3] w-full animate-pulse rounded-lg bg-surface"
          />
        ))}
      </div>
    </section>
  );
}
