import { describe, expect, it } from "vitest";
import { sanitizeWordPressHtml } from "./sanitize-html";

describe("WordPress HTML sanitization", () => {
  it("preserves approved editorial markup and UTF-8", () => {
    const result = sanitizeWordPressHtml("<h2>Επιτυχίες ’24</h2><p><strong>Ποδόσφαιρο</strong></p>");
    expect(result).toBe("<h2>Επιτυχίες ’24</h2><p><strong>Ποδόσφαιρο</strong></p>");
  });

  it("removes executable markup, event handlers, styles and unsafe URLs", () => {
    const result = sanitizeWordPressHtml('<script>alert(1)</script><p style="color:red" onclick="bad()">Safe</p><a href="javascript:bad()">Bad</a>');
    expect(result).toBe("<p>Safe</p><a>Bad</a>");
  });

  it("hardens links that open a new browsing context", () => {
    const result = sanitizeWordPressHtml('<a href="https://example.com" target="_blank">Example</a>');
    expect(result).toContain('rel="noopener noreferrer"');
  });
});
