import { useCallback, useEffect, useRef, useState } from "react";
import { isBrowser, updateQueryParams } from "../lib/queryState";

export type QueryHistoryMode = "push" | "replace";

export type UseQueryStateOptions<T> = {
  parse?: (raw: string) => T;
  serialize?: (value: T, defaultValue: T) => string | null;
  history?: QueryHistoryMode | ((next: T, prev: T) => QueryHistoryMode);
  debounceMs?: number;
};

const defaultSerialize = <T,>(value: T, defaultValue: T) => {
  if (value === undefined || value === null) return null;
  if (Object.is(value, defaultValue)) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? null : String(value);
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return JSON.stringify(value);
};

const defaultParse = <T,>(raw: string, defaultValue: T): T => {
  if (typeof defaultValue === "number") {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) throw new Error("Invalid number");
    return parsed as T;
  }

  if (typeof defaultValue === "boolean") {
    if (raw === "1" || raw === "true") return true as T;
    if (raw === "0" || raw === "false") return false as T;
    throw new Error("Invalid boolean");
  }

  if (typeof defaultValue === "string") {
    return raw as T;
  }

  return JSON.parse(raw) as T;
};

export const useQueryState = <T,>(
  key: string,
  defaultValue: T,
  options: UseQueryStateOptions<T> = {}
) => {
  const { parse, serialize, history = "replace", debounceMs } = options;
  const parseValue = useCallback(
    (raw: string | null) => {
      if (raw === null) return { value: defaultValue, invalid: false };
      try {
        const next = parse ? parse(raw) : defaultParse(raw, defaultValue);
        return { value: next, invalid: false };
      } catch {
        return { value: defaultValue, invalid: true };
      }
    },
    [defaultValue, parse]
  );

  const initial = isBrowser ? parseValue(new URLSearchParams(window.location.search).get(key)) : { value: defaultValue, invalid: false };
  const [value, setValue] = useState<T>(initial.value);
  const hasMounted = useRef(false);
  const invalidOnInit = useRef(initial.invalid);
  const previousValue = useRef<T>(initial.value);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isBrowser) return;

    const handlePopState = () => {
      const { value: nextValue } = parseValue(new URLSearchParams(window.location.search).get(key));
      setValue((current) => (Object.is(current, nextValue) ? current : nextValue));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [key, parseValue]);

  useEffect(() => {
    if (!isBrowser || !invalidOnInit.current) return;
    invalidOnInit.current = false;
    updateQueryParams({ [key]: null }, { managedKeys: [key], replace: true });
  }, [key]);

  useEffect(() => {
    if (!isBrowser) return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      previousValue.current = value;
      return;
    }

    const mode = typeof history === "function" ? history(value, previousValue.current) : history;
    const serialized = (serialize || defaultSerialize)(value, defaultValue);
    const scheduleUpdate = () => {
      updateQueryParams({ [key]: serialized }, { managedKeys: [key], replace: mode === "replace" });
      previousValue.current = value;
    };

    if (debounceMs && debounceMs > 0) {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(scheduleUpdate, debounceMs);
      return;
    }

    scheduleUpdate();
  }, [value, key, defaultValue, history, serialize, debounceMs]);

  return [value, setValue] as const;
};
