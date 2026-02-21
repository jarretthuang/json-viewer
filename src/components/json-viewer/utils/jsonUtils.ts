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
