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
    (time) => now - time < RATE_LIMIT_WINDOW,
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
  const fromName = process.env.SMTP_FROM_NAME || "SoccerX Camp";

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

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailRow(label: string, value: string | number) {
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);

  return `
    <tr>
      <td
        style="
          width:38%;
          border-top:1px solid #e6e5df;
          padding:12px 8px 12px 0;
          color:#777c78;
          font-size:11px;
          font-weight:700;
          letter-spacing:.7px;
          text-transform:uppercase;
          vertical-align:top;
        "
      >
        ${safeLabel}
      </td>

      <td
        style="
          border-top:1px solid #e6e5df;
          padding:12px 0 12px 8px;
          color:#090b0a;
          font-size:14px;
          font-weight:600;
          line-height:1.5;
          vertical-align:top;
        "
      >
        ${safeValue}
      </td>
    </tr>
  `;
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
      },
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
      },
    );
  }

  /*
   * Reject obviously oversized requests before reading them.
   */
  const contentLength = Number(
    request.headers.get("content-length") ?? 0,
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
      },
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
        },
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
      },
    );
  }

  /*
   * Validate all form fields before attempting email delivery.
   */
  const parsed = participationRequestSchema.safeParse(input);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "validation_failed",
      },
      {
        status: 400,
      },
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
      },
    );
  }

  const smtp = getEnvironment();

  if (!smtp) {
    console.error(
      "[participation] SMTP configuration is incomplete.",
    );

    return NextResponse.json(
      {
        ok: false,
        code: "service_unavailable",
      },
      {
        status: 503,
      },
    );
  }

  const data = parsed.data;

  const safeAthleteName = data.athleteName.replace(
    /[\r\n]+/g,
    " ",
  );

  /*
   * Plain-text fallback for email clients that do not render HTML.
   */
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

  /*
   * Branded HTML email.
   *
   * Email clients have limited CSS support, so styles are kept inline
   * and the layout uses presentation tables for broad compatibility.
   */
  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <title>SoccerX Camp participation application</title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background:#f2f0e9;
      color:#090b0a;
      font-family:Arial, Helvetica, sans-serif;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width:100%;
        margin:0;
        padding:0;
        background:#f2f0e9;
        border-collapse:collapse;
      "
    >
      <tr>
        <td
          align="center"
          style="padding:40px 16px;"
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width:100%;
              max-width:680px;
              background:#ffffff;
              border-collapse:collapse;
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background:#0b3528;
                  padding:36px 40px;
                  color:#ffffff;
                "
              >
                <div
                  style="
                    margin-bottom:14px;
                    color:#ffffff;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:2px;
                    text-transform:uppercase;
                    opacity:.72;
                  "
                >
                  SoccerX Camp
                </div>

                <h1
                  style="
                    margin:0;
                    max-width:520px;
                    color:#ffffff;
                    font-size:34px;
                    line-height:1;
                    letter-spacing:-1px;
                    text-transform:uppercase;
                  "
                >
                  New participation<br />
                  application
                </h1>
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td
                style="
                  padding:36px 40px 16px;
                "
              >
                <div
                  style="
                    width:44px;
                    height:4px;
                    margin-bottom:24px;
                    background:#c9362b;
                    font-size:0;
                    line-height:0;
                  "
                >
                  &nbsp;
                </div>

                <p
                  style="
                    margin:0;
                    color:#555b57;
                    font-size:15px;
                    line-height:1.7;
                  "
                >
                  A new athlete application has been submitted
                  through the SoccerX Camp website.
                </p>
              </td>
            </tr>

            <!-- Athlete profile -->
            <tr>
              <td
                style="
                  padding:20px 40px;
                "
              >
                <h2
                  style="
                    margin:0 0 18px;
                    color:#090b0a;
                    font-size:13px;
                    line-height:1.3;
                    letter-spacing:1.5px;
                    text-transform:uppercase;
                  "
                >
                  Athlete profile
                </h2>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    width:100%;
                    border-collapse:collapse;
                  "
                >
                  ${emailRow("Athlete", data.athleteName)}
                  ${emailRow("Birth date", data.birthDate)}
                  ${emailRow("Current club", data.currentClub)}
                  ${emailRow("Position", data.position)}
                  ${emailRow("City", data.city)}
                  ${emailRow("Height", `${data.height} cm`)}
                  ${emailRow("Weight", `${data.weight} kg`)}
                </table>
              </td>
            </tr>

            <!-- Parent / guardian -->
            <tr>
              <td
                style="
                  padding:20px 40px;
                "
              >
                <h2
                  style="
                    margin:0 0 18px;
                    color:#090b0a;
                    font-size:13px;
                    line-height:1.3;
                    letter-spacing:1.5px;
                    text-transform:uppercase;
                  "
                >
                  Parent / guardian
                </h2>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    width:100%;
                    border-collapse:collapse;
                  "
                >
                  ${emailRow("Name", data.guardianName)}
                  ${emailRow("Email", data.email)}
                  ${emailRow("Phone", data.phone)}
                </table>
              </td>
            </tr>

            <!-- Participation notes -->
            <tr>
              <td
                style="
                  padding:20px 40px;
                "
              >
                <h2
                  style="
                    margin:0 0 18px;
                    color:#090b0a;
                    font-size:13px;
                    line-height:1.3;
                    letter-spacing:1.5px;
                    text-transform:uppercase;
                  "
                >
                  Participation notes
                </h2>

                <div
                  style="
                    border-left:4px solid #c9362b;
                    padding:18px 20px;
                    background:#f7f6f1;
                    color:#303431;
                    font-size:14px;
                    line-height:1.7;
                  "
                >
                  ${escapeHtml(data.notes).replaceAll(
                    "\n",
                    "<br />",
                  )}
                </div>
              </td>
            </tr>

            <!-- Consent -->
            <tr>
              <td
                style="
                  padding:20px 40px 40px;
                "
              >
                <div
                  style="
                    border:1px solid #d8d8d3;
                    padding:18px 20px;
                  "
                >
                  <div
                    style="
                      margin-bottom:6px;
                      color:#777c78;
                      font-size:10px;
                      font-weight:700;
                      line-height:1.4;
                      letter-spacing:1.2px;
                      text-transform:uppercase;
                    "
                  >
                    Informed consent and acknowledgement
                  </div>

                  <div
                    style="
                      color:#0b3528;
                      font-size:15px;
                      font-weight:700;
                      line-height:1.5;
                    "
                  >
                    &#10003; Accepted
                  </div>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  border-top:1px solid #e0dfda;
                  padding:24px 40px;
                  color:#777c78;
                  font-size:11px;
                  line-height:1.6;
                "
              >
                Submitted through the SoccerX Camp
                participation application.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

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
      html,
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "[participation] Email delivery failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        code: "delivery_failed",
      },
      {
        status: 502,
      },
    );
  }
}