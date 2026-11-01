import * as Sentry from '@sentry/nextjs';
import { scrubBreadcrumbUrl, stripJsonQueryParam } from './sentry-scrub';

// withSentryConfig injects this entry point for Next.js 14's webpack builds.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    beforeSend(event) {
      if (typeof event.request?.url === 'string') {
        event.request.url = stripJsonQueryParam(event.request.url);
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) {
        for (const key of ['url', 'to', 'from']) {
          if (typeof breadcrumb.data[key] === 'string') {
            breadcrumb.data[key] = scrubBreadcrumbUrl(breadcrumb.data[key]);
          }
        }
      }
      return breadcrumb;
    },
  });
}
