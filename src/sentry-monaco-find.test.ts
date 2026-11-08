import type { ErrorEvent } from '@sentry/nextjs';
import { isMonacoFindRegexEvent } from './sentry-monaco-find';

const regexMessage = 'Invalid regular expression: synthetic pattern';
function event(value = regexMessage, fn = 'eW.findMatchesInNode'): ErrorEvent {
  return { exception: { values: [{ value, stacktrace: { frames: [{ function: fn }] } }] } };
}

describe('Monaco find telemetry guard', () => {
  it.each(['findMatchesInNode', 'eW.findMatchesInNode', 'eV.findMatchesLineByLine'])(
    'matches the execution signature %s', (fn) => {
      expect(isMonacoFindRegexEvent(event(regexMessage, fn))).toBe(true);
    }
  );

  it.each([
    {}, { message: regexMessage },
    { exception: { values: [{ value: regexMessage }] } },
    event('Network failed'),
    event(regexMessage, 'otherSearch'),
    event(regexMessage, 'findMatchesInNodeElsewhere'),
    event('Invalid regular expression [redacted]'),
    // Never combine a message on one exception with frames on another.
    { exception: { values: [{ value: regexMessage }, { value: 'Other error', stacktrace: { frames: [{ function: 'eW.findMatchesInNode' }] } }] } },
  ])('preserves unrelated or incomplete events', (input) => {
    expect(isMonacoFindRegexEvent(input)).toBe(false);
  });
});
