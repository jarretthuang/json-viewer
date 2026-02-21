import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export const JSON_QUERY_PARAM = "json";
export const MAX_QUERY_PARAM_LENGTH = 20000;

export function decodeJsonQueryParam(param: string | null): string | undefined {
  return param ? decompressFromEncodedURIComponent(param) ?? undefined : undefined;
}

export function encodeJsonQueryParam(
  text: string,
  maxLength: number = MAX_QUERY_PARAM_LENGTH,
): string | undefined {
  if (!text) {
    return undefined;
  }

  const encodedText = compressToEncodedURIComponent(text);
  if (encodedText.length > maxLength) {
    return undefined;
  }

  return encodedText;
}

export function buildUrlWithQueryParam(url: string, key: string, value: string): string {
  const urlObject = new URL(url);
  urlObject.searchParams.set(key, value);
  return urlObject.href;
}

export function buildUrlWithoutQueryParam(url: string, key: string): string {
  const urlObject = new URL(url);
  urlObject.searchParams.delete(key);
  return urlObject.href;
}
