# Movie Search Case — Web Frontend

Frontend of the DEPT movie-search case: a Next.js 16 app that browses,
searches, and dispatches TMDB (The Movie Database) data to the browser.
It pairs with the .NET API in the parent `api/` project.

## Tech stack

- **Framework**: Next.js 16 (App Router, server + client components, React 19)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/postcss`)
- **Testing**: Vitest + Testing Library (jsdom)
- **Data source**: The Movie Database (TMDB) API via a TMDB v4 read-access token
- **Tooling**: pnpm, ESLint + Prettier

## Requirements

- Node.js 22.11+
- pnpm
- A free TMDB API Read Access Token (https://www.themoviedb.org)

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a local env file from the example and fill in your TMDB token:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   - `NEXT_PUBLIC_API_BASE_URL` — base URL of the .NET API (default points at `http://localhost:3000/api/v1`)
   - `TMDB_API_KEY` — your TMDB v4 read access token

3. Run the app in development:

   ```bash
   pnpm dev
   ```

   The app is served at `http://localhost:3000`.

## Common scripts

| Command            | What it does                          |
| ------------------ | -------------------------------------- |
| `pnpm dev`         | Start the dev server (turbo mode)     |
| `pnpm build`       | Produce a production build            |
| `pnpm start`       | Run the production build              |
| `pnpm lint`        | Run ESLint across the project        |
| `pnpm typecheck`   | Type-check with `tsc --noEmit`       |

## Features

- **Trending movies and shows** — browse daily or weekly trending titles
- **Search** — search movies or TV shows, with suggestions and paginated results
- **Title details** — view movie and show information, ratings, credits, reviews,
  similar titles, and videos; show pages also include seasons and episodes
- **People** — view person biographies and credits
- **Watchlist** — save movies and shows, mark them as favorites or watched
- **Personalization and sharing** — switch between light and dark themes,
  English and German, and share detail pages

## Architecture notes

- The server-side client in `lib/api.ts` fetches from the API configured with
  `NEXT_PUBLIC_API_BASE_URL`. This frontend includes TMDB-backed Next.js API routes 
  under `app/api/v1/...`; search suggestions call these routes directly. The TMDB token 
  is used server-side rather than sent to the browser.
- The Next.js TMDB routes cache search responses for about 2 minutes, trending
  and most detail responses for 1 hour.
  The frontend client also configures fetch caching for supported reads from
  `NEXT_PUBLIC_API_BASE_URL`; its search requests use `no-store`.
- Watchlist entries are persisted in browser `localStorage` through
  `lib/store.ts`. The locale is shared through a React context and persisted in
  a cookie, while the theme preference is stored in `localStorage`.
