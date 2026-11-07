import { isProEnabled } from ".";

const originalEnv = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnv };
});

test.each([undefined, "", "false", "TRUE", "1", "true"])(
  "enables Pro only for the exact string true (value: %s)",
  (value) => {
    if (value === undefined) delete process.env.NEXT_PUBLIC_PRO_ENABLED;
    else process.env.NEXT_PUBLIC_PRO_ENABLED = value;
    expect(isProEnabled()).toBe(value === "true");
  }
);
