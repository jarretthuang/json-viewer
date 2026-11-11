import type { ErrorEvent } from '@sentry/nextjs';
import { isMonacoFindRegexEvent } from './sentry-monaco-find';

const regexMessage = 'Invalid regular expression: synthetic pattern';
function event(value = regexMessage, fn = 'eW.findMatchesInNode'): ErrorEvent {
  return { type: undefined, exception: { values: [{ value, stacktrace: { frames: [{ function: fn }] } }] } };
}

describe('Monaco find telemetry guard', () => {
  it.each(['findMatchesInNode', 'eW.findMatchesInNode', 'eV.findMatchesLineByLine'])(
    'matches the execution signature %s', (fn) => {
      expect(isMonacoFindRegexEvent(event(regexMessage, fn))).toBe(true);
    }
  );

  it.each(['findMatchesInNode', 'findMatchesLineByLine'])(
    'matches the embedded stack signature %s without parsed find frames', (fn) => {
      const value = `${regexMessage}\n\nSyntaxError: synthetic pattern\n    at eW.${fn} (https://example.test/editor.js:1:1)`;
      expect(isMonacoFindRegexEvent(event(value, 'otherSearch'))).toBe(true);
      expect(isMonacoFindRegexEvent({ type: undefined, exception: { values: [{ value }] } })).toBe(true);
    }
  );

  it.each([
    {}, { message: regexMessage },
    { exception: { values: [{ value: regexMessage }] } },
    event('Network failed'),
    event('Network failed\n    at findMatchesInNode', 'otherSearch'),
    event(`${regexMessage}\n\n    at otherSearch`, 'otherSearch'),
    event(`${regexMessage}\n\n    at findMatchesInNodeElsewhere`, 'otherSearch'),
    { exception: { values: [{ value: regexMessage }, { value: 'Other error\nfindMatchesInNode' }] } },
    event(regexMessage, 'otherSearch'),
    event(regexMessage, 'findMatchesInNodeElsewhere'),
    event('Invalid regular expression [redacted]'),
    // Never combine a message on one exception with frames on another.
    { exception: { values: [{ value: regexMessage }, { value: 'Other error', stacktrace: { frames: [{ function: 'eW.findMatchesInNode' }] } }] } },
  ])('preserves unrelated or incomplete events', (input) => {
    expect(isMonacoFindRegexEvent({ ...input, type: undefined })).toBe(false);
  });
});
