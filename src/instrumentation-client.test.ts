import * as Sentry from '@sentry/nextjs';
import type { ErrorEvent } from '@sentry/nextjs';

jest.mock('@sentry/nextjs', () => ({ init: jest.fn() }));

describe('client beforeSend', () => {
  const previousDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  afterAll(() => {
    if (previousDsn === undefined) delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    else process.env.NEXT_PUBLIC_SENTRY_DSN = previousDsn;
  });

  it('drops only the Monaco find signature before scrubbing and preserves other diagnostics', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://synthetic@example.test/1';
    await import('./instrumentation-client');
    const options = jest.mocked(Sentry.init).mock.calls[0][0]!;
    const send = (event: ErrorEvent) => options.beforeSend!(event, {});
    const matching: ErrorEvent = { exception: { values: [{
      value: 'Invalid regular expression: synthetic pattern',
      stacktrace: { frames: [{ function: 'RegExp.exec' }, { function: 'eW.findMatchesInNode' }] },
    }] } };
    expect(send(matching)).toBeNull();

    const unrelated: ErrorEvent = {
      request: { url: 'https://example.test/?json=SYNTHETIC&theme=dark' },
      message: 'Invalid regular expression: synthetic pattern',
      exception: { values: [{ value: 'Invalid regular expression: synthetic pattern', stacktrace: { frames: [{ function: 'otherSearch' }] } }] },
    };
    expect(send(unrelated)).toBe(unrelated);
    expect(unrelated.exception!.values![0].value).toBe('Invalid regular expression [redacted]');
    expect(unrelated.message).toBe('Invalid regular expression [redacted]');
    expect(unrelated.request!.url).toBe('https://example.test/?theme=dark');
    const ordinary: ErrorEvent = { message: 'Network failed' };
    expect(send(ordinary)).toBe(ordinary);
  });
});
