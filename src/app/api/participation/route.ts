import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { participationRequestSchema } from "@/lib/participation/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_SIZE = 16_000;
const RATE_LIMIT_WINDOW = 30 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

const attempts = new Map<string, number[]>();

function clientAddress(request: Request) {
  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    // x-forwarded-for:
    // client, proxy1, proxy2
    return forwardedFor.split(",")[0]?.trim() || "unknown";
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

function getEnvironment() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  const from = process.env.SMTP_FROM_EMAIL;
  const fromName =
    process.env.SMTP_FROM_NAME || "SoccerX Camp";

  const to = process.env.PARTICIPATION_TO_EMAIL;

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
    user,
    pass,
    from,
    fromName,
    to,
  };
}

export async function POST(request: Request) {
  /*
   * Basic CSRF protection.
   */
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

  /*
   * Only accept JSON.
   */
  const contentType = request.headers.get("content-type");

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

  /*
   * Reject obviously oversized requests before reading them.
   */
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

  /*
   * Validate all form fields before attempting email delivery.
   */
  const parsed =
    participationRequestSchema.safeParse(input);

  if (!parsed.success) {
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
   * Rate-limit valid submissions.
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

  const smtp = getEnvironment();

  if (!smtp) {
    console.error(
      "[participation] SMTP configuration is incomplete."
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

  const data = parsed.data;

  const safeAthleteName = data.athleteName.replace(
    /[\r\n]+/g,
    " "
  );

  const body = [
    "New SoccerX Camp participation application",
    "",
    `Athlete: ${data.athleteName}`,
    `Guardian: ${data.guardianName}`,
    `Birth date: ${data.birthDate}`,
    `Current club: ${data.currentClub}`,
    `Position: ${data.position}`,
    `City: ${data.city}`,
    `Height: ${data.height} cm`,
    `Weight: ${data.weight} kg`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    "",
    "Participation notes:",
    data.notes,
    "",
    "Informed consent and acknowledgement: Accepted",
  ].join("\n");

  try {
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,

      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },

      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });

    await transport.sendMail({
      to: smtp.to,

      from: {
        name: smtp.fromName,
        address: smtp.from,
      },

      replyTo: {
        name: data.guardianName,
        address: data.email,
      },

      subject: `SoccerX Camp — Participation: ${safeAthleteName}`,

      text: body,
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "[participation] Email delivery failed:",
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