import type { ErrorEvent } from '@sentry/nextjs';

/**
 * Last-resort telemetry guard for Monaco's private tree-search execution path.
 * Construction errors already get inline feedback, but RegExp.exec can escape
 * that catch. Require both signatures on the SAME exception, before redaction;
 * missing/minified-away frames and unrelated regex failures remain reportable.
 */
export function isMonacoFindRegexEvent(event: ErrorEvent): boolean {
  return event.exception?.values?.some((exception) =>
    typeof exception.value === 'string' &&
    /^(?:SyntaxError: |Error: )?Invalid regular expression(?::|$)/.test(exception.value) &&
    exception.stacktrace?.frames?.some((frame) =>
      typeof frame.function === 'string' &&
      /^(?:[\w$]+\.)?findMatches(?:InNode|LineByLine)$/.test(frame.function)
    ) === true
  ) === true;
}
