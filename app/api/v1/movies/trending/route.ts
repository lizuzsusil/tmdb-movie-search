import {
  getTrendingWindowFromTmdb,
  problemJson,
  TmdbUpstreamError,
} from "~/lib/tmdb";
import type { TrendingWindow } from "~/types/trending";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") ?? "en";
  const window: TrendingWindow =
    searchParams.get("window") === "day" ? "day" : "week";
  try {
    const movies = await getTrendingWindowFromTmdb(
      "movie",
      window,
      request.signal,
      language,
    );
    return Response.json(movies);
  } catch (error) {
    if (error instanceof TmdbUpstreamError) {
      return problemJson(
        502,
        "Upstream service unavailable",
        "TMDB did not return trending movies.",
      );
    }
    return problemJson(500, "Internal server error", "Unexpected error.");
  }
}
