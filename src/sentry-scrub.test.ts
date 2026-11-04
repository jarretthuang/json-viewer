import { scrubBreadcrumbUrl, stripJsonQueryParam } from './sentry-scrub';

describe('Sentry URL scrubbing', () => {
  it('removes every json parameter, including encoded keys, preserving other context', () => {
    expect(stripJsonQueryParam('https://jsonviewer.io/view?json=ONE&theme=dark&%6ason=TWO#tree'))
      .toBe('https://jsonviewer.io/view?theme=dark#tree');
    expect(stripJsonQueryParam('https://jsonviewer.io/?json=COMPRESSED'))
      .toBe('https://jsonviewer.io/');
    expect(stripJsonQueryParam('https://jsonviewer.io/?theme=dark'))
      .toBe('https://jsonviewer.io/?theme=dark');
  });

  it('keeps only origin and path for breadcrumb URLs', () => {
    expect(scrubBreadcrumbUrl('https://jsonviewer.io/view?json=SECRET&other=SECRET#tree'))
      .toBe('https://jsonviewer.io/view');
    expect(scrubBreadcrumbUrl('https://jsonviewer.io/view')).toBe('https://jsonviewer.io/view');
    expect(scrubBreadcrumbUrl('/view?json=SECRET&other=SECRET#tree')).toBe('/view');
  });

  it.each(['', 'not a URL', 'https://[invalid'])('safely preserves unparseable input %s', (url) => {
    expect(stripJsonQueryParam(url)).toBe(url);
    expect(scrubBreadcrumbUrl(url)).toBe(url);
  });
});
