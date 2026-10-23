export interface SavedTitle {
  id: number;
  title: string;
  type: "movies" | "shows";
  posterPath?: string | null;
  watched?: boolean;
  favorite?: boolean;
  rating?: number | null;
}

export type WatchlistTab = "all" | "favorites" | "watched";
