import * as Sentry from '@sentry/nextjs';
import { scrubBreadcrumbUrl, scrubStackFrames, stripJsonQueryParam } from './src/sentry-scrub';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    beforeSend(event) {
      if (typeof event.request?.url === 'string') {
        event.request.url = stripJsonQueryParam(event.request.url);
      }
      for (const exception of event.exception?.values ?? []) {
        scrubStackFrames(exception.stacktrace?.frames ?? []);
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
