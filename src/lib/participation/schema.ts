import { z } from "zod";

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid birth date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Invalid birth date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return date <= new Date();
  }, "Birth date cannot be in the future");

export const participationRequestSchema = z.object({
  athleteName: z.string().trim().min(2).max(120),

  guardianName: z.string().trim().min(2).max(120),

  birthDate: birthDateSchema,

  currentClub: z.string().trim().min(2).max(120),

  position: z.string().trim().min(1).max(40),

  city: z.string().trim().min(2).max(100),

  height: z.coerce
    .number()
    .int()
    .min(100)
    .max(230),

  weight: z.coerce
    .number()
    .min(30)
    .max(180),

  email: z.string().trim().email().max(254),

  phone: z.string().trim().min(6).max(40),

  notes: z.string().trim().min(10).max(4000),

  consent: z.literal(true),

  // Honeypot. Legitimate submissions must leave this empty.
  website: z.string().max(0).optional().default(""),
});

export type ParticipationRequest = z.infer<
  typeof participationRequestSchema
>;