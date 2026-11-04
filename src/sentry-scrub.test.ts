import { scrubBreadcrumbUrl, scrubErrorMessage, stripJsonQueryParam } from './sentry-scrub';

describe('Sentry error message scrubbing', () => {
  it.each([
    'Invalid regular expression: /{"synthetic":"private"}/: Invalid escape',
    'SyntaxError: Invalid regular expression: /[/: Unterminated character class',
  ])('redacts regex patterns even in short messages', (message) => {
    expect(scrubErrorMessage(message)).toBe('Invalid regular expression [redacted]');
  });

  it.each([
    `Parse failed: { "synthetic": "${'x'.repeat(501)}" }`,
    `Parse failed: "synthetic": "${'x'.repeat(501)}"`,
  ])('redacts long JSON-looking messages without retaining a document prefix', (message) => {
    expect(scrubErrorMessage(message)).toBe('Error message [redacted]');
  });

  it.each(['', 'Network request failed', 'x'.repeat(501), 'Unexpected token at position 12'])
    ('preserves ordinary diagnostics', (message) => {
      expect(scrubErrorMessage(message)).toBe(message);
    });
});

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
