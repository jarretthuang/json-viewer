export const LARGE_JSON_TEXT_LENGTH = 100_000;
export const XL_JSON_TEXT_LENGTH = 750_000;
export const MAX_URL_SYNC_SOURCE_LENGTH = 100_000;
export const JSON_URL_SYNC_DEBOUNCE_MS = 300;
export const LARGE_JSON_URL_SYNC_DEBOUNCE_MS = 1_000;
export const MAX_HIGHLIGHT_TEXT_LENGTH = 100_000;
export const MAX_EXPAND_ALL_NODE_COUNT = 5_000;
export const ARRAY_CHILD_CHUNK_SIZE = 100;

export function isLargeJsonText(text: string): boolean {
  return text.length >= LARGE_JSON_TEXT_LENGTH;
}

export function isXLJsonText(text: string): boolean {
  return text.length >= XL_JSON_TEXT_LENGTH;
}

export function shouldSyncJsonTextToUrl(text: string): boolean {
  return text.length > 0 && text.length <= MAX_URL_SYNC_SOURCE_LENGTH;
}

export function getJsonUrlSyncDelay(text: string): number {
  return isLargeJsonText(text)
    ? LARGE_JSON_URL_SYNC_DEBOUNCE_MS
    : JSON_URL_SYNC_DEBOUNCE_MS;
}

export function shouldHighlightJsonText(text: string): boolean {
  return text.length <= MAX_HIGHLIGHT_TEXT_LENGTH;
}

export function shouldAllowExpandAll(nodeCount: number): boolean {
  return nodeCount > 0 && nodeCount <= MAX_EXPAND_ALL_NODE_COUNT;
}
