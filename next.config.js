const { withSentryConfig } = require('@sentry/nextjs/config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { instrumentationHook: true },
  // The public browser DSN is derived from the same deployment variable.
  env: { NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN || '' },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
  sourcemaps: { disable: true },
});
