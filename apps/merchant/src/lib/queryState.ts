export const isBrowser = typeof window !== "undefined";

export type ParseSchema<T> = {
  [K in keyof T]: {
    parse: (value: string) => T[K];
    defaultValue: T[K];
  };
};

export const parseState = <T extends Record<string, unknown>>(
  params: URLSearchParams,
  schema: ParseSchema<T>
): T => {
  const result = {} as T;

  (Object.keys(schema) as Array<keyof T>).forEach((key) => {
    const { parse, defaultValue } = schema[key];
    const raw = params.get(String(key));
    if (raw === null) {
      result[key] = defaultValue;
      return;
    }

    try {
      result[key] = parse(raw);
    } catch {
      result[key] = defaultValue;
    }
  });

  return result;
};

export const serializeState = (
  state: Record<string, unknown>,
  defaults: Record<string, unknown> = {}
): Record<string, string> => {
  const params: Record<string, string> = {};

  Object.entries(state).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(defaults, key) && Object.is(value, defaults[key])) {
      return;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") return;
      params[key] = trimmed;
      return;
    }

    if (typeof value === "number") {
      if (Number.isNaN(value)) return;
      params[key] = String(value);
      return;
    }

    if (typeof value === "boolean") {
      params[key] = value ? "1" : "0";
      return;
    }

    params[key] = JSON.stringify(value);
  });

  return params;
};

export const parseNumberParam = (value: string | null, fallback: number) => {
  if (value === null) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const parseBooleanParam = (value: string | null, fallback: boolean) => {
  if (value === null) return fallback;
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return fallback;
};

export const parseJsonParam = <T>(value: string | null, fallback: T): T => {
  if (value === null) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const parseStringArrayParam = (value: string | null, fallback: string[] = []) => {
  if (value === null) return fallback;
  if (value.trim() === "") return fallback;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

export type UpdateQueryParamsOptions = {
  managedKeys?: string[];
  replace?: boolean;
};

export const updateQueryParams = (
  nextParams: Record<string, string | null | undefined>,
  options: UpdateQueryParamsOptions = {}
) => {
  if (!isBrowser) return;

  const url = new URL(window.location.href);
  const managedKeys = options.managedKeys ?? Object.keys(nextParams);

  managedKeys.forEach((key) => {
    url.searchParams.delete(key);
  });

  Object.entries(nextParams).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const trimmed = typeof value === "string" ? value.trim() : String(value);
    if (trimmed === "") return;
    url.searchParams.set(key, trimmed);
  });

  const query = url.searchParams.toString();
  const nextUrl = query ? `${url.pathname}?${query}` : url.pathname;

  if (options.replace) {
    window.history.replaceState({}, "", nextUrl);
  } else {
    window.history.pushState({}, "", nextUrl);
  }
};
