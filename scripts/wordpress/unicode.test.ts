import { describe, expect, it } from "vitest";
import { XMLParser } from "fast-xml-parser";

describe("WordPress UTF-8 preservation", () => {
  it("preserves Greek text and Unicode punctuation exactly", () => {
    const expected = "Ποιοι είμαστε – Ιούνιος ’24";
    const xml = `<?xml version="1.0" encoding="UTF-8"?><root><title><![CDATA[${expected}]]></title></root>`;
    const parser = new XMLParser({
      ignoreAttributes: false,
      processEntities: false,
      parseTagValue: false,
    });

    const parsed = parser.parse(xml) as { root: { title: string } };

    expect(parsed.root.title).toBe(expected);
    expect(Buffer.from(parsed.root.title, "utf8").toString("utf8")).toBe(expected);
  });

  it("decodes percent-encoded Greek slugs without transliteration", () => {
    const encoded =
      "%cf%80%ce%bf%ce%b9%ce%bf%ce%b9-%ce%b5%ce%af%ce%bc%ce%b1%cf%83%cf%84%ce%b5";

    expect(decodeURIComponent(encoded)).toBe("ποιοι-είμαστε");
  });
});
