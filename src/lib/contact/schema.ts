import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().min(2).max(140),
  message: z.string().trim().min(10).max(4000),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
