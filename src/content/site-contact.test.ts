import { describe, expect, it } from "vitest";
import { siteContact } from "./site-contact";

describe("public contact contract", () => {
  it("contains the two WXR-confirmed telephone numbers and email addresses", () => {
    expect(siteContact.phones.map(item => item.label)).toEqual(["+30 6930 393091", "+49 176 47324548"]);
    expect(siteContact.emails.map(item => item.label)).toEqual(["am@soccerandmore.org", "dp@soccerandmore.org"]);
  });
  it("uses callable and emailable links", () => {
    expect(siteContact.phones.every(item => item.href.startsWith("tel:+"))).toBe(true);
    expect(siteContact.emails.every(item => item.href === `mailto:${item.label}`)).toBe(true);
  });
});
