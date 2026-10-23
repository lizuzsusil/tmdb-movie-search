"use client";

import { useId, useState } from "react";

import { useLocale } from "~/components/LocaleProvider";

export function ShareButton({ url, label }: { url?: string; label?: string }) {
  const { strings } = useLocale();
  const [copied, setCopied] = useState(false);
  const labelId = useId();

  async function share() {
    const target =
      url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(target);
    } catch {
      const area = document.createElement("textarea");
      area.value = target;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-labelledby={label ? undefined : labelId}
        aria-label={label}
        className="w-fit rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <span id={labelId}>
          {copied ? strings["share.done"] : strings["copy.idle"]}
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? strings["share.done"] : ""}
      </span>
    </>
  );
}
