import { describe, expect, it } from "vitest";
import { participationRequestSchema } from "./schema";

const valid = {
  athleteName: "Giannis Dimitriou",
  guardianName: "Pavlos Dimitriou",
  birthDate: "2008-10-17",
  currentClub: "Barcelona FC",
  position: "RW-LW",
  city: "Athens",
  height: "182",
  weight: "71",
  email: "example@example.com",
  phone: "+306912345678",
  notes:
    "I would like to participate in the next SoccerX Camp event.",
  consent: true,
  website: "",
};

describe("participation request validation", () => {
  it("accepts the complete approved application shape", () => {
    expect(
      participationRequestSchema.safeParse(valid).success
    ).toBe(true);
  });

  it("rejects missing consent", () => {
    expect(
      participationRequestSchema.safeParse({
        ...valid,
        consent: false,
      }).success
    ).toBe(false);
  });

  it("rejects implausible height", () => {
    expect(
      participationRequestSchema.safeParse({
        ...valid,
        height: "50",
      }).success
    ).toBe(false);
  });

  it("rejects implausible weight", () => {
    expect(
      participationRequestSchema.safeParse({
        ...valid,
        weight: "250",
      }).success
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      participationRequestSchema.safeParse({
        ...valid,
        email: "not-an-email",
      }).success
    ).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(
      participationRequestSchema.safeParse({
        ...valid,
        website: "https://spam.example.com",
      }).success
    ).toBe(false);
  });

  it("rejects a future birth date", () => {
    expect(
      participationRequestSchema.safeParse({
        ...valid,
        birthDate: "2099-01-01",
      }).success
    ).toBe(false);
  });
});