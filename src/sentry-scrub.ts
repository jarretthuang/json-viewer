/** JSON-VIEWER-A leaked pasted document content through a regex exception message. */
export function scrubErrorMessage(message: string): string {
  if (/Invalid regular expression/i.test(message)) {
    // Never preserve a slice of the pattern: even a short one can contain user data.
    return 'Invalid regular expression [redacted]';
  }
  // Long messages containing JSON object/key syntax may embed a pasted document.
  if (message.length > 500 && /\{\s*"|"[^"\r\n]*"\s*:/.test(message)) {
    return 'Error message [redacted]';
  }
  return message;
}

/** Remove the document from request URLs while preserving other URL context. */
export function stripJsonQueryParam(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('json');
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Breadcrumbs only need the origin and path, never query or fragment data. */
export function scrubBreadcrumbUrl(url: string): string {
  try {
    // Sentry shortens same-origin navigation URLs to root-relative paths.
    if (url.startsWith('/') && !url.startsWith('//')) {
      return new URL(url, 'https://sentry-scrub.invalid').pathname;
    }
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}
