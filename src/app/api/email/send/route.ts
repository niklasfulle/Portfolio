import { checkContactRateLimit } from "@/lib/contact-rate-limit";
import { sendContactMail } from "@/lib/helpers/send-mail";
import { NextResponse } from "next/server";
import { z } from "zod";

const MAX_BODY_BYTES = 16 * 1024;

export const runtime = "nodejs";

const contactMessageSchema = z
  .object({
    senderEmail: z.email().trim().max(254),
    topic: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(5000),
  })
  .strict();

async function readJsonBody(req: Request) {
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new RangeError("Request body is too large");
  }

  if (!req.body) {
    throw new SyntaxError("Request body is missing");
  }

  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let rawBody = "";
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("Request body is too large");
    }
    rawBody += decoder.decode(value, { stream: true });
  }

  rawBody += decoder.decode();
  return JSON.parse(rawBody) as unknown;
}

export async function POST(req: Request) {
  const retryAfter = checkContactRateLimit(req);
  if (retryAfter !== null) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later.", success: false },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  try {
    const body = contactMessageSchema.parse(await readJsonBody(req));
    await sendContactMail(body.senderEmail, body.topic, body.message);

    return NextResponse.json(
      { message: "Message sent successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json(
        { message: "Request body is too large", success: false },
        { status: 413 },
      );
    }

    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid request", success: false },
        { status: 400 },
      );
    }

    console.error(
      "Contact email delivery failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { message: "The message could not be sent", success: false },
      { status: 500 },
    );
  }
}
