import { getSeasonFromTmdb, problemJson } from "~/lib/tmdb";
import { parseId, requestLocale, upstreamError } from "~/lib/api-route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; season: string }> },
) {
  const { id: rawId, season: rawSeason } = await params;
  const parsed = parseId(rawId);
  if ("response" in parsed) return parsed.response;
  const season = Number.parseInt(rawSeason, 10);
  if (!Number.isInteger(season) || season < 0) {
    return problemJson(
      400,
      "Bad request",
      "Path parameter 'season' must be a non-negative integer.",
    );
  }
  try {
    return Response.json(
      await getSeasonFromTmdb(
        parsed.id,
        season,
        request.signal,
        requestLocale(request),
      ),
    );
  } catch (error) {
    return upstreamError(error, "season");
  }
}
