import {
  getMovieDetailsFromTmdb,
  problemJson,
  TmdbUpstreamError,
} from "~/lib/tmdb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id) || id < 1) {
    return problemJson(
      400,
      "Bad request",
      "Path parameter 'id' must be a positive integer.",
    );
  }

  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") ?? "en";

  try {
    const details = await getMovieDetailsFromTmdb(id, request.signal, language);
    return Response.json(details);
  } catch (error) {
    if (error instanceof TmdbUpstreamError && error.status === 404) {
      return problemJson(404, "Not found", `No movie found with id ${id}.`);
    }
    if (error instanceof TmdbUpstreamError) {
      return problemJson(
        502,
        "Upstream service unavailable",
        "TMDB did not return movie details.",
      );
    }
    return problemJson(500, "Internal server error", "Unexpected error.");
  }
}
