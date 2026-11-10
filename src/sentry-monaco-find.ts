import type { ErrorEvent } from '@sentry/nextjs';

/**
 * Last-resort telemetry guard for Monaco's private tree-search execution path.
 * Construction errors already get inline feedback, but RegExp.exec can escape
 * that catch. Require both signatures on the SAME exception, before redaction;
 * unrelated regex failures remain reportable without either find signature.
 */
export function isMonacoFindRegexEvent(event: ErrorEvent): boolean {
  return event.exception?.values?.some((exception) =>
    typeof exception.value === 'string' &&
    /^(?:SyntaxError: |Error: )?Invalid regular expression(?::|$)/.test(exception.value) &&
    (exception.stacktrace?.frames?.some((frame) =>
      typeof frame.function === 'string' &&
      /^(?:[\w$]+\.)?findMatches(?:InNode|LineByLine)$/.test(frame.function)
    ) === true ||
      // Monaco rethrows with the original stack appended to the message. Sentry
      // can exhaust its 50-frame parser limit before reaching those find frames,
      // while retaining the full value. Prefer parsed frames; use text as fallback.
      // A document containing these exact names inside an invalid pattern could
      // also match, but both signatures must still occur on the same exception.
      /\bfindMatches(?:InNode|LineByLine)\b/.test(exception.value))
  ) === true;
}
