import * as Sentry from '@sentry/nextjs';
import { stripJsonQueryParam } from './src/sentry-scrub';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    beforeSend(event) {
      if (typeof event.request?.url === 'string') {
        event.request.url = stripJsonQueryParam(event.request.url);
      }
      return event;
    },
  });
}
