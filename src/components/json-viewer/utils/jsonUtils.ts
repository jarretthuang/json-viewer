import _ from "lodash";

export function getJsonParseErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error.toUpperCase();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export function parseJsonText(text: string): unknown | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function parseJsonTextWithError(text: string): {
  parsed: unknown | undefined;
  errorMessage: string;
} {
  try {
    return { parsed: JSON.parse(text), errorMessage: "" };
  } catch (error) {
    return { parsed: undefined, errorMessage: getJsonParseErrorMessage(error) };
  }
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function removeJsonItemAtPath(
  source: unknown,
  path: (string | number)[]
): unknown {
  if (path.length === 0) return source;

  const cloned = _.cloneDeep(source);
  const parentPath = path.slice(0, -1);
  const key = path[path.length - 1];

  const parent =
    parentPath.length === 0
      ? cloned
      : parentPath.reduce<any>(
          (acc, part) => (acc == null ? undefined : acc[part]),
          cloned
        );

  if (Array.isArray(parent) && typeof key === "number") {
    if (key < 0 || key >= parent.length) return cloned;
    parent.splice(key, 1);
    return cloned;
  }

  if (
    parent &&
    typeof parent === "object" &&
    !Array.isArray(parent) &&
    typeof key === "string"
  ) {
    if (!(key in parent)) return cloned;
    delete (parent as Record<string, unknown>)[key];
    return cloned;
  }

  return cloned;
}
