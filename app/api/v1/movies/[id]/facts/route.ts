import { getMovieFactsFromTmdb } from "~/lib/tmdb";
import { parseId, requestLocale, upstreamError } from "~/lib/api-route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = parseId((await params).id);
  if ("response" in parsed) return parsed.response;
  try {
    return Response.json(
      await getMovieFactsFromTmdb(
        parsed.id,
        request.signal,
        requestLocale(request),
      ),
    );
  } catch (error) {
    return upstreamError(error, "movie facts");
  }
}
