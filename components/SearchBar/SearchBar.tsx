"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type SyntheticEvent,
} from "react";

import type { Movie } from "~/types/movie";
import type { PagedMovies, SearchBarProps, SearchType } from "~/types/search";
import { STRINGS, t } from "~/lib/i18n";
import { debounce } from "~/lib/debounce";
import { useLocale } from "~/components/LocaleProvider";

function buildTarget(query: string, type: SearchType): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return "/";
  }
  return `/?${new URLSearchParams({ query: trimmed, page: "1", type }).toString()}`;
}

function suggestionHref(type: SearchType, id: number): string {
  return type === "shows" ? `/shows/${id}` : `/movies/${id}`;
}

export function SearchBar({ locale: override }: SearchBarProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { locale: ctxLocale, strings: ctxStrings } = useLocale();
  const locale = override ?? ctxLocale;
  const strings = override ? (STRINGS[override] ?? STRINGS.en) : ctxStrings;
  const urlQuery = searchParams.get("query") ?? "";
  const urlType = searchParams.get("type") === "shows" ? "shows" : "movies";
  const [query, setQuery] = useState(urlQuery);
  const [type, setType] = useState<SearchType>(urlType);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestAbort = useRef<AbortController | null>(null);
  const fetchSuggestions = useCallback(
    async (value: string, nextType: SearchType) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) {
        setSuggestions([]);
        setOpen(false);
        setActiveIndex(-1);
        return;
      }
      const controller = new AbortController();
      suggestAbort.current = controller;
      try {
        const params = new URLSearchParams({
          query: trimmed,
          page: "1",
          language: locale,
        });
        const base = nextType === "shows" ? "shows" : "movies";
        const response = await fetch(
          `/api/v1/${base}/search?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(
            `Search suggestions request failed (${response.status})`,
          );
        }
        const data = (await response.json()) as PagedMovies;
        if (controller.signal.aborted) return;
        setSuggestions((data.results ?? []).slice(0, 6));
        setOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Unable to load search suggestions.", error);
        }
      }
    },
    [locale],
  );
  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 300),
    [fetchSuggestions],
  );
  const listId = "search-suggestions";
  const hintId = "search-suggestions-hint";
  const listOpen = open && suggestions.length > 0;

  useEffect(() => {
    setQuery(urlQuery);
    setType(urlType);
  }, [urlQuery, urlType]);

  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
      suggestAbort.current?.abort();
    };
  }, [debouncedFetchSuggestions]);

  function navigate(target: string) {
    setOpen(false);
    startTransition(() => {
      router.push(target);
    });
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    debouncedFetchSuggestions.cancel();
    suggestAbort.current?.abort();
    navigate(buildTarget(query, type));
  }

  function handleChange(value: string) {
    setQuery(value);
    debouncedFetchSuggestions.cancel();
    suggestAbort.current?.abort();
    suggestAbort.current = null;
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      if (!value.trim()) {
        const target =
          type === "shows"
            ? `/?${new URLSearchParams({ type }).toString()}`
            : "/";
        startTransition(() => {
          router.replace(target, { scroll: false });
        });
      }
      return;
    }
    debouncedFetchSuggestions(value, type);
  }

  function focusOption(index: number) {
    const el = document.getElementById(`suggestion-${suggestions[index]?.id}`);
    (el?.querySelector("a") as HTMLAnchorElement | null)?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!listOpen) return;
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
      let next: number;
      if (event.key === "ArrowDown")
        next = activeIndex >= suggestions.length - 1 ? 0 : activeIndex + 1;
      else if (event.key === "ArrowUp")
        next = activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1;
      else if (event.key === "Home") next = 0;
      else next = suggestions.length - 1;
      setActiveIndex(next);
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent<HTMLAnchorElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const last = suggestions.length - 1;
    let next: number;
    if (event.key === "ArrowDown")
      next = activeIndex >= last ? 0 : activeIndex + 1;
    else if (event.key === "ArrowUp")
      next = activeIndex <= 0 ? last : activeIndex - 1;
    else if (event.key === "Home") next = 0;
    else next = last;
    setActiveIndex(next);
    focusOption(next);
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  function handleTypeChange(next: SearchType) {
    setType(next);
    if (query.trim()) {
      navigate(buildTarget(query, next));
    } else {
      router.replace(`/?${new URLSearchParams({ type: next }).toString()}`, {
        scroll: false,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-busy={isPending}
      className="flex w-full max-w-md flex-col gap-2"
    >
      <div
        role="group"
        aria-label={strings["search.category.label"]}
        className="flex w-fit gap-1 rounded-md border border-border p-1"
      >
        {(["movies", "shows"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={type === option}
            onClick={() => handleTypeChange(option)}
            className={`rounded px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
              type === option
                ? "bg-brand-600 text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {option === "movies"
              ? strings["search.category.movies"]
              : strings["search.category.shows"]}
          </button>
        ))}
      </div>
      <div className="relative flex w-full gap-2" onBlur={handleBlur}>
        <label htmlFor="movie-search" className="sr-only">
          {type === "shows"
            ? strings["search.label.show"]
            : strings["search.label.movie"]}
        </label>
        <p id={hintId} className="sr-only">
          {t(locale, "search.hint")}
        </p>
        <input
          id="movie-search"
          type="search"
          name="query"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={
            type === "shows"
              ? `${strings["search.label.show"]}…`
              : `${strings["search.label.movie"]}…`
          }
          autoComplete="off"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={hintId}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-brand-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? strings["search.pending"] : strings["search.button"]}
        </button>
        {listOpen && (
          <p role="status" className="sr-only">
            {t(locale, "search.suggestions.count", {
              count: suggestions.length,
            })}
          </p>
        )}
        {listOpen && (
          <ul
            id={listId}
            role="listbox"
            aria-label={t(locale, "search.suggestions.label", {
              query: query.trim(),
            })}
            className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-md border border-border bg-surface shadow-lg"
          >
            {suggestions.map((movie, i) => (
              <li
                key={movie.id}
                role="presentation"
                className={i === activeIndex ? "bg-surface-hover" : ""}
              >
                <a
                  id={`suggestion-${movie.id}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  href={suggestionHref(type, movie.id)}
                  onKeyDown={handleListKeyDown}
                  onMouseEnter={() => setActiveIndex(i)}
                  onFocus={() => setActiveIndex(i)}
                  className="flex items-baseline justify-between gap-2 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
                >
                  <span className="truncate font-medium text-foreground">
                    {movie.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {movie.releaseDate?.slice(0, 4)}
                    {movie.voteAverage > 0 && (
                      <span>
                        {` · ${movie.voteAverage.toFixed(1)}`}
                        <span className="sr-only"> out of 10</span>
                      </span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
