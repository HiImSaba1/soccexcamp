import { describe, expect, it } from "vitest";
import { stories } from "./stories";

describe("migrated editorial stories", () => {
  it("pairs the WXR translations as one canonical story", () => {
    expect(stories).toHaveLength(1);
    expect(stories[0].source).toMatchObject({ enWordPressId: 2337, elWordPressId: 2321, featuredAttachmentId: 2317 });
    expect(stories[0].content.en.title).toBeTruthy();
    expect(stories[0].content.el.title).toBeTruthy();
  });

  it("keeps imported media approval-gated", () => {
    expect(stories.every(story => story.source.mediaStatus === "awaiting-approval")).toBe(true);
  });
});
