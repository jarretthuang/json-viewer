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
