import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { cookies, headers } from "next/headers";

import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import { LocaleProvider } from "~/components/LocaleProvider";
import { ThemeToggle } from "~/components/ThemeToggle";
import { getLocaleFromCookie, t } from "~/lib/i18n";
import type { Locale } from "~/types/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Movie Search Case",
    template: "%s | Movie Search Case",
  },
  description: "DEPT full-stack hiring case — a TMDB-backed movie search app.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Movie Search Case",
    description: "Search trending movies and TV shows, powered by TMDB.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.dataset.theme="light";}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get("cookie") ?? undefined;
  const fallback = (await cookies()).get("locale")?.value;
  const locale: Locale =
    fallback === "de" || fallback === "en"
      ? fallback
      : getLocaleFromCookie(cookieHeader);
  return (
    <html lang={locale}>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {locale === "de"
            ? "Zum Hauptinhalt springen"
            : "Skip to main content"}
        </a>
        <LocaleProvider initialLocale={locale}>
          <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-4">
            <nav
              aria-label={
                locale === "de" ? "Hauptnavigation" : "Main navigation"
              }
              className="flex items-center gap-1 text-sm"
            >
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 font-medium text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                {t(locale, "nav.home")}
              </Link>
              <Link
                href="/watchlist"
                className="rounded-md px-3 py-1.5 font-medium text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                {t(locale, "nav.watchlist")}
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </header>
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
