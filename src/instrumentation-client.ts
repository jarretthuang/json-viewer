import * as Sentry from '@sentry/nextjs';
import { scrubBreadcrumbUrl, scrubErrorMessage, stripJsonQueryParam } from './sentry-scrub';

// Next.js 15.3+ loads this entry point before hydration.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    ignoreErrors: [
      /Share canceled/,
      /Document is not focused/,
      /captured as exception/,
      /reading 'isVisible'/,
    ],
    beforeSend(event) {
      if (typeof event.request?.url === 'string') {
        event.request.url = stripJsonQueryParam(event.request.url);
      }
      for (const exception of event.exception?.values ?? []) {
        if (typeof exception.value === 'string') {
          exception.value = scrubErrorMessage(exception.value);
        }
      }
      // Some capture paths also copy the exception text into the event message.
      if (typeof event.message === 'string') {
        event.message = scrubErrorMessage(event.message);
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
