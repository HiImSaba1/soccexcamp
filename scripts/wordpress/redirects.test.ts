import { describe, expect, it } from "vitest";
import redirects from "../../migration/generated/redirects.json";

describe("legacy redirects", () => {
  it("has unique evidence-backed sources", () => {
    const sources = redirects.map(item => item.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("does not publish either private Thessaloniki route", () => {
    expect(redirects.some(item => item.source.includes("camp-thessaloniki") || item.source.includes("θεσσαλονίκη"))).toBe(false);
  });

  it("routes Greek legacy pages through locale preservation", () => {
    const greek = redirects.filter(item => item.source.startsWith("/el/"));
    expect(greek.length).toBeGreaterThan(0);
    expect(greek.every(item => item.destination.startsWith("/api/legacy-locale?redirect="))).toBe(true);
  });

  it("consolidates the translated June 2024 posts on one canonical story", () => {
    expect(redirects.find(item => item.source === "/soccerxcamp-june-24")?.destination).toBe("/stories/june-2024");
    expect(redirects.find(item => item.source === "/el/soccerxcamp-iounios-24")?.destination).toContain("/stories/june-2024");
  });
});
