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

  it.each(['browser', 'nodejs', 'edge'])('scrubs request URLs in %s', async (runtime) => {
    const { beforeSend } = await initOptions(runtime);
    const event = {
      message: 'Failure',
      request: { url: 'https://jsonviewer.io/?json=COMPRESSED&theme=dark', method: 'GET' },
    };
    expect(await beforeSend!(event, {})).toEqual({
      message: 'Failure',
      request: { url: 'https://jsonviewer.io/?theme=dark', method: 'GET' },
    });
    for (const untouched of [{}, { request: {} }, { request: { url: 'invalid URL' } }]) {
      expect(await beforeSend!(untouched, {})).toEqual(untouched);
    }
  });

  it('scrubs all browser breadcrumb URL fields and preserves other data', async () => {
    const { beforeBreadcrumb } = await initOptions('browser');
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
