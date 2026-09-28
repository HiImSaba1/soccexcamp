import { describe, expect, it } from "vitest";
import { contactRequestSchema } from "./schema";

const valid = { name: "Giannis Dimitriou", email: "giannis@example.com", phone: "+30 691 234 5678", subject: "Participation information", message: "I would like more information about a future SoccerX Camp event.", consent: true, website: "" };

describe("contact request validation", () => {
  it("accepts a valid bilingual-safe contact request", () => {
    expect(contactRequestSchema.safeParse({ ...valid, message: "Θα ήθελα περισσότερες πληροφορίες για τη διοργάνωση." }).success).toBe(true);
  });
  it("rejects an invalid email and missing consent", () => {
    expect(contactRequestSchema.safeParse({ ...valid, email: "invalid", consent: false }).success).toBe(false);
  });
  it("rejects a populated spam honeypot", () => {
    expect(contactRequestSchema.safeParse({ ...valid, website: "https://spam.example" }).success).toBe(false);
  });
});
