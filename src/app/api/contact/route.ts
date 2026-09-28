import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { contactRequestSchema } from "@/lib/contact/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_SIZE = 12_000;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const attempts = new Map<string, number[]>();

function clientAddress(request: Request) {
  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return (
      forwardedFor.split(",")[0]?.trim() ||
      "unknown"
    );
  }

  return "unknown";
}

function isRateLimited(address: string) {
  const now = Date.now();

  const recent = (attempts.get(address) ?? []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  );

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    attempts.set(address, recent);
    return true;
  }

  recent.push(now);
  attempts.set(address, recent);

  return false;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function smtpConfiguration() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  const from = process.env.SMTP_FROM_EMAIL;
  const fromName =
    process.env.SMTP_FROM_NAME || "SoccerX Camp";

  const to = process.env.CONTACT_TO_EMAIL;

  if (
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !user ||
    !pass ||
    !from ||
    !to
  ) {
    return null;
  }

  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    from,
    fromName,
    to,
  };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_origin",
      },
      {
        status: 403,
      }
    );
  }

  const contentType =
    request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_content_type",
      },
      {
        status: 415,
      }
    );
  }

  const contentLength = Number(
    request.headers.get("content-length") ?? 0
  );

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_BODY_SIZE
  ) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_request",
      },
      {
        status: 413,
      }
    );
  }

  let input: unknown;

  try {
    const raw = await request.text();

    if (raw.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          code: "invalid_request",
        },
        {
          status: 413,
        }
      );
    }

    input = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_request",
      },
      {
        status: 400,
      }
    );
  }

  const result =
    contactRequestSchema.safeParse(input);

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "validation_failed",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Only valid requests count toward the limiter.
   * Invalid payloads should not consume a legitimate
   * visitor's submission allowance.
   */
  const address = clientAddress(request);

  if (isRateLimited(address)) {
    return NextResponse.json(
      {
        ok: false,
        code: "rate_limited",
      },
      {
        status: 429,
      }
    );
  }

  const smtp = smtpConfiguration();

  if (!smtp) {
    console.error(
      "[contact] SMTP configuration is incomplete."
    );

    return NextResponse.json(
      {
        ok: false,
        code: "service_unavailable",
      },
      {
        status: 503,
      }
    );
  }

  const {
    name,
    email,
    phone,
    subject,
    message,
  } = result.data;

  /*
   * Prevent line breaks from reaching the email subject.
   */
  const safeSubject = subject.replace(
    /[\r\n]+/g,
    " "
  );

  const body = [
    "New SoccerX Camp contact enquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    const transporter =
      nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,

        auth: smtp.auth,

        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });

    await transporter.sendMail({
      to: smtp.to,

      from: {
        name: smtp.fromName,
        address: smtp.from,
      },

      replyTo: {
        name,
        address: email,
      },

      subject: `SoccerX Camp — Contact: ${safeSubject}`,

      text: body,
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "[contact] Email delivery failed:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "delivery_failed",
      },
      {
        status: 502,
      }
    );
  }
}