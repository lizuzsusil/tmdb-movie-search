import { problemJson, searchShowsTmdb, TmdbUpstreamError } from "~/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const rawPage = searchParams.get("page") ?? "1";
  const page = Number.parseInt(rawPage, 10);

  if (!query) {
    return problemJson(
      400,
      "Bad request",
      "Query parameter 'query' is required.",
    );
  }

  if (!Number.isInteger(page) || page < 1) {
    return problemJson(
      400,
      "Bad request",
      "Query parameter 'page' must be a positive integer.",
    );
  }

  const language = searchParams.get("language") ?? "en";

  try {
    const result = await searchShowsTmdb(query, page, request.signal, language);
    return Response.json(result);
  } catch (error) {
    if (error instanceof TmdbUpstreamError) {
      return problemJson(
        502,
        "Upstream service unavailable",
        "TMDB did not return show search results.",
      );
    }
    return problemJson(500, "Internal server error", "Unexpected error.");
  }
}
