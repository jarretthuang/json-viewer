import { getNextThemeMode } from "./themeModeUtils";

describe("getNextThemeMode", () => {
  it("cycles light -> dark", () => {
    expect(getNextThemeMode("light")).toBe("dark");
  });

  it("cycles dark -> system", () => {
    expect(getNextThemeMode("dark")).toBe("system");
  });

  it("cycles system/unknown -> light", () => {
    expect(getNextThemeMode("system")).toBe("light");
    expect(getNextThemeMode(undefined)).toBe("light");
    expect(getNextThemeMode("anything")).toBe("light");
  });
});
