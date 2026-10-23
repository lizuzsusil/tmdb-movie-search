"use client";

import { useLocale } from "~/components/LocaleProvider";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { strings } = useLocale();
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">
        {strings["error.title"]}
      </h1>
      <p role="alert" className="text-sm text-muted">
        {strings["error.body"]}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        {strings["error.retry"]}
      </button>
    </main>
  );
}
