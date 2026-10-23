import type { Locale, LocaleOverrideProps } from "~/types/locale";
import type { Movie } from "~/types/movie";

export type SearchType = "movies" | "shows";

export interface PagedMovies {
  page: number;
  results: Movie[];
  totalPages: number;
  totalResults: number;
}

export type SearchBarProps = LocaleOverrideProps;

export interface SearchResultsProps {
  query: string;
  results: PagedMovies;
  type: SearchType;
  locale?: Locale;
}

export interface SearchSectionProps {
  query: string;
  page: number;
  type: SearchType;
  locale?: Locale;
}
