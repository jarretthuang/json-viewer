import {
  escapeHtml,
  highlightJsonText,
} from "./JsonViewerEditor";
import { MAX_HIGHLIGHT_TEXT_LENGTH } from "../utils/jsonPerformanceUtils";

describe("JsonViewerEditor helpers", () => {
  test("escapeHtml escapes markup-significant characters", () => {
    expect(escapeHtml(`{"tag":"<script>&'"}`)).toBe(
      "{&quot;tag&quot;:&quot;&lt;script&gt;&amp;&#39;&quot;}"
    );
  });

  test("highlightJsonText returns escaped plain text above the highlight threshold", () => {
    const largeCode = `<value>${"x".repeat(MAX_HIGHLIGHT_TEXT_LENGTH)}</value>`;

    expect(highlightJsonText(largeCode)).toBe(
      `&lt;value&gt;${"x".repeat(MAX_HIGHLIGHT_TEXT_LENGTH)}&lt;/value&gt;`
    );
  });

  test("highlightJsonText still highlights smaller JSON", () => {
    expect(highlightJsonText('{"a":1}')).toContain("token");
  });
});
