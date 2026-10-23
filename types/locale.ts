export type Locale = "en" | "de";

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  strings: Record<string, string>;
}

export interface LocaleOverrideProps {
  locale?: Locale;
}
