import type { DebouncedFunction } from "~/types/debounce";

export function debounce<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
  delay: number,
): DebouncedFunction<Args> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const debounced: DebouncedFunction<Args> = (...args: Args) => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = undefined;
      callback(...args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  return debounced;
}
