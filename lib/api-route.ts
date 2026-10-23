import { TmdbUpstreamError } from "~/lib/tmdb";
import { problemJson } from "~/lib/tmdb";

export function parseId(
  rawId: string,
): { id: number } | { response: Response } {
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id < 1) {
    return {
      response: problemJson(
        400,
        "Bad request",
        "Path parameter 'id' must be a positive integer.",
      ),
    };
  }
  return { id };
}

export function requestLocale(request: Request): string {
  return new URL(request.url).searchParams.get("language") ?? "en";
}

export function upstreamError(error: unknown, resource: string): Response {
  if (error instanceof TmdbUpstreamError && error.status === 404) {
    return problemJson(404, "Not found", `No ${resource} found.`);
  }
  if (error instanceof TmdbUpstreamError) {
    return problemJson(
      502,
      "Upstream service unavailable",
      `TMDB did not return ${resource}.`,
    );
  }
  return problemJson(500, "Internal server error", "Unexpected error.");
}
