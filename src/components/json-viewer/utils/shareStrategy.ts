import { encodeJsonQueryParam } from "./jsonUrlUtils";

export type ShareMode = "auto" | "url" | "drive";

export type ShareTarget =
  | { type: "url"; encoded: string }
  | { type: "drive" };

export function resolveShareTarget(
  text: string,
  mode: ShareMode,
  maxUrlLength: number,
): ShareTarget {
  if (mode === "drive") {
    return { type: "drive" };
  }

  const encoded = encodeJsonQueryParam(text, maxUrlLength);

  if (mode === "url") {
    if (!encoded) {
      throw new Error("JSON payload is too large for URL sharing.");
    }

    return { type: "url", encoded };
  }

  if (encoded) {
    return { type: "url", encoded };
  }

  return { type: "drive" };
}
