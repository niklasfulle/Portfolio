/** @jest-environment node */

var mockSendContactMail: jest.Mock;

jest.mock("@/lib/helpers/send-mail", () => {
  mockSendContactMail = jest.fn();
  return { sendContactMail: mockSendContactMail };
});

import {
  POST,
  resetContactRateLimitForTests,
} from "@/app/api/email/send/route";

const validBody = {
  senderEmail: "sender@example.com",
  topic: "Hello",
  message: "A message",
};

function requestWithBody(
  body: unknown,
  options: { ip?: string; contentLength?: number; raw?: string } = {},
) {
  const rawBody = options.raw ?? JSON.stringify(body);
  const headers = new Headers({
    "content-type": "application/json",
    "x-real-ip": options.ip ?? "127.0.0.1",
  });
  if (options.contentLength !== undefined) {
    headers.set("content-length", String(options.contentLength));
  }

  return new Request("http://localhost/api/email/send", {
    method: "POST",
    headers,
    body: rawBody,
  });
}

describe("POST /api/email/send", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetContactRateLimitForTests();
    mockSendContactMail.mockResolvedValue(undefined);
  });

  it("sends a validated message without accepting a client-selected recipient", async () => {
    const response = await POST(requestWithBody(validBody));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "Message sent successfully",
      success: true,
    });
    expect(mockSendContactMail).toHaveBeenCalledWith(
      validBody.senderEmail,
      validBody.topic,
      validBody.message,
    );
  });

  it.each([
    [{ ...validBody, contactEmail: "attacker@example.com" }],
    [{ ...validBody, senderEmail: "not-an-email" }],
    [{ ...validBody, topic: "" }],
    [{ ...validBody, message: "x".repeat(5001) }],
  ])("rejects invalid or unexpected input", async (body) => {
    const response = await POST(requestWithBody(body));

    expect(response.status).toBe(400);
    expect(mockSendContactMail).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      requestWithBody(null, { raw: "{", ip: "127.0.0.2" }),
    );

    expect(response.status).toBe(400);
    expect(mockSendContactMail).not.toHaveBeenCalled();
  });

  it.each([
    [{ contentLength: 20_000, ip: "127.0.0.3" }],
    [{ raw: `"${"x".repeat(17_000)}"`, ip: "127.0.0.4" }],
  ])("rejects oversized request bodies", async (options) => {
    const response = await POST(requestWithBody(validBody, options));

    expect(response.status).toBe(413);
    expect(mockSendContactMail).not.toHaveBeenCalled();
  });

  it("rate-limits repeated requests from the same client", async () => {
    const ip = "127.0.0.5";
    for (let requestNumber = 0; requestNumber < 5; requestNumber += 1) {
      const response = await POST(requestWithBody(validBody, { ip }));
      expect(response.status).toBe(200);
    }

    const blockedResponse = await POST(requestWithBody(validBody, { ip }));
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get("retry-after")).toMatch(/^\d+$/);
    expect(mockSendContactMail).toHaveBeenCalledTimes(5);
  });

  it("returns a stable server error when delivery fails", async () => {
    mockSendContactMail.mockRejectedValue(new Error("SMTP unavailable"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(
      requestWithBody(validBody, { ip: "127.0.0.6" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "The message could not be sent",
      success: false,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Contact email delivery failed:",
      "SMTP unavailable",
    );
    errorSpy.mockRestore();
  });
});
