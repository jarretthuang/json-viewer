jest.mock('@sentry/nextjs', () => ({ init: jest.fn() }));

describe('optional Sentry initialization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it.each(['nodejs', 'edge'])('skips %s initialization without a DSN', async (runtime) => {
    process.env.NEXT_RUNTIME = runtime;
    const { register } = await import('./instrumentation');
    await register();
    const Sentry = await import('@sentry/nextjs');
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it.each(['nodejs', 'edge'])('initializes %s with SENTRY_DSN', async (runtime) => {
    process.env.NEXT_RUNTIME = runtime;
    process.env.SENTRY_DSN = 'https://public@example.com/1';
    const { register } = await import('./instrumentation');
    await register();
    const Sentry = await import('@sentry/nextjs');
    expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({ dsn: process.env.SENTRY_DSN }));
  });

  it('skips browser initialization without a DSN', async () => {
    await import('./instrumentation-client');
    const Sentry = await import('@sentry/nextjs');
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('initializes the browser with the build-time DSN', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://public@example.com/1';
    await import('./instrumentation-client');
    const Sentry = await import('@sentry/nextjs');
    expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN }));
  });
});


describe('Sentry URL privacy hooks', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      SENTRY_DSN: 'https://public@example.com/1',
      NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.com/1',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  async function initOptions(runtime: string) {
    if (runtime === 'browser') {
      await import('./instrumentation-client');
    } else {
      process.env.NEXT_RUNTIME = runtime;
      const { register } = await import('./instrumentation');
      await register();
    }
    const Sentry = await import('@sentry/nextjs');
    return jest.mocked(Sentry.init).mock.calls[0][0]!;
  }

  it('redacts browser exception chains and duplicate event messages, preserving diagnostics', async () => {
    const { beforeSend } = await initOptions('browser');
    const message = 'Invalid regular expression: /{"synthetic":"private"}/: Invalid escape';
    expect(await beforeSend!({
      type: undefined,
      message,
      exception: { values: [
        { type: 'SyntaxError', value: message },
        { type: 'Error', value: 'Ordinary failure' },
        { type: 'Error' },
      ] },
    }, {})).toEqual({
      type: undefined,
      message: 'Invalid regular expression [redacted]',
      exception: { values: [
        { type: 'SyntaxError', value: 'Invalid regular expression [redacted]' },
        { type: 'Error', value: 'Ordinary failure' },
        { type: 'Error' },
      ] },
    });
  });

  it('configures the browser noise filters', async () => {
    const { ignoreErrors } = await initOptions('browser');
    expect(ignoreErrors).toEqual([
      /Share canceled/,
      /cancellation of share/,
      /Document is not focused/,
      /captured as (exception|promise rejection)/,
      /reading 'isVisible'/,
      /Failed to execute 'importScripts'/,
    ]);
  });

  it.each([
    ['AbortError: Share canceled', true],
    ['NotAllowedError: Document is not focused.', true],
    ['Event: Event `Event` (type=error) captured as exception', true],
    ["TypeError: Cannot read properties of undefined (reading 'isVisible')", true],
    ['AbortError: Abort due to cancellation of share.', true],
    ['Event: Event `Event` (type=error) captured as promise rejection', true],
    ["Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'https://jsonviewer.io/_next/static/chunks/211.6062429607874dac.js' failed to load.", true],
    ['Error: Unrelated application failure', false],
    ['ChunkLoadError: Loading chunk 211 failed.', false],
    ['NetworkError: Failed to fetch', false],
    ["Failed to execute 'postMessage' on 'Worker': Data cannot be cloned, out of memory", false],
    ['RangeError: Invalid string length', false],
    ['Error: Unable to share document', false],
  ])('matches browser noise for %s: %s', async (message, ignored) => {
    const { ignoreErrors } = await initOptions('browser');
    expect(ignoreErrors!.some((pattern) => (
      typeof pattern === 'string' ? message.includes(pattern) : pattern.test(message)
    ))).toBe(ignored);
  });

  it.each(['browser', 'nodejs', 'edge'])('scrubs request URLs in %s', async (runtime) => {
    const { beforeSend } = await initOptions(runtime);
    const event = {
      type: undefined,
      message: 'Failure',
      request: { url: 'https://jsonviewer.io/?json=COMPRESSED&theme=dark', method: 'GET' },
    };
    expect(await beforeSend!(event, {})).toEqual({
      type: undefined,
      message: 'Failure',
      request: { url: 'https://jsonviewer.io/?theme=dark', method: 'GET' },
    });
    for (const untouched of [{}, { request: {} }, { request: { url: 'invalid URL' } }]) {
      expect(await beforeSend!({ type: undefined, ...untouched }, {})).toEqual(untouched);
    }
  });

  it.each(['browser', 'nodejs', 'edge'])('scrubs all %s breadcrumb URL fields and preserves other data', async (runtime) => {
    const { beforeBreadcrumb } = await initOptions(runtime);
    expect(beforeBreadcrumb!({
      category: 'navigation',
      data: {
        url: 'https://jsonviewer.io/?json=COMPRESSED&theme=dark',
        to: '/next?json=NEW',
        from: '/previous?json=OLD',
        status_code: 200,
      },
    }, {})).toEqual({
      category: 'navigation',
      data: {
        url: 'https://jsonviewer.io/',
        to: '/next',
        from: '/previous',
        status_code: 200,
      },
    });
    for (const untouched of [{}, { data: {} }, { data: { url: 42, to: null, from: 'invalid URL' } }]) {
      expect(beforeBreadcrumb!(untouched, {})).toEqual(untouched);
    }
  });
});
