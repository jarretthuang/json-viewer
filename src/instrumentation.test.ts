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
    expect(Sentry.init).toHaveBeenCalledWith({ dsn: process.env.SENTRY_DSN });
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
    expect(Sentry.init).toHaveBeenCalledWith({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
  });
});
