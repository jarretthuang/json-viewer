import * as Sentry from '@sentry/nextjs';

// withSentryConfig injects this entry point for Next.js 14's webpack builds.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
}
