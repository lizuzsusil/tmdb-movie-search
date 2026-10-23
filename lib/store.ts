"use client";

import type { SavedTitle } from "~/types/watchlist";

const STORAGE_KEY = "watchlist:v2";

function readRaw(key: string): SavedTitle[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTitle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readSaved(): SavedTitle[] {
  return readRaw(STORAGE_KEY);
}

function writeAll(entries: SavedTitle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
  window.dispatchEvent(new CustomEvent("saved-titles-change"));
}

export function toggleSaved(
  entry: Omit<SavedTitle, "watched" | "favorite" | "rating">,
): SavedTitle[] {
  const current = readSaved();
  const exists = current.some(
    (e) => e.id === entry.id && e.type === entry.type,
  );
  const next = exists
    ? current.filter((e) => !(e.id === entry.id && e.type === entry.type))
    : [...current, { ...entry, watched: false, favorite: false, rating: null }];
  writeAll(next);
  return next;
}

export function updateSaved(
  id: number,
  type: "movies" | "shows",
  patch: Partial<Pick<SavedTitle, "watched" | "favorite" | "rating">>,
): SavedTitle[] {
  const next = readSaved().map((e) =>
    e.id === id && e.type === type ? { ...e, ...patch } : e,
  );
  writeAll(next);
  return next;
}

export function isSaved(id: number, type: "movies" | "shows"): boolean {
  return readSaved().some((e) => e.id === id && e.type === type);
}

export function onSavedChange(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener("saved-titles-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("saved-titles-change", handler);
    window.removeEventListener("storage", handler);
  };
}
