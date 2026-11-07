import { licenseEmailHtml, licenseEmailText } from "./email";

const key = "eyJ2IjoxLCJwcm8iOiJleGFtcGxlIn0.example_signature-123";

it("includes the license key, activation and recovery links, and PRO badge", () => {
  const html = licenseEmailHtml(key);
  expect(html).toContain(key);
  expect(html).toContain('href="https://jsonviewer.io/pro"');
  expect(html).toContain('href="https://jsonviewer.io/pro/lost-key"');
  expect(html).toMatch(/<span[^>]*border:[^>]*>PRO<\/span>/);
  expect(html).toContain("Thank you for choosing JSON Viewer PRO.");
});

it("escapes HTML characters in the license key", () => {
  const html = licenseEmailHtml('<key>&"\'');
  expect(html).toContain("&lt;key&gt;&amp;&quot;&#39;");
  expect(html).not.toContain("<key>");
});

it("preserves the plain text fallback with the PRO product name", () => {
  expect(licenseEmailText(key)).toBe(
    `Thank you for choosing JSON Viewer PRO. Keep this key safe:\n\n${key}\n\nActivate it at https://jsonviewer.io/pro`
  );
});
