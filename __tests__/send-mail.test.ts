import nodemailer from "nodemailer";
import { sendContactMail } from "@/lib/helpers/send-mail";

jest.mock("nodemailer", () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

const mockedTransporter = { sendMail: jest.fn() };

describe("sendContactMail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODEMAILER_EMAIL = "portfolio@example.com";
    process.env.NODEMAILER_PW = "test-password";
    process.env.CONTACT_EMAIL = "owner@example.com";
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockedTransporter);
    mockedTransporter.sendMail.mockResolvedValue({ messageId: "test" });
  });

  afterEach(() => {
    delete process.env.NODEMAILER_EMAIL;
    delete process.env.NODEMAILER_PW;
    delete process.env.CONTACT_EMAIL;
  });

  it("rejects when the sender credential is missing", async () => {
    delete process.env.NODEMAILER_EMAIL;
    await expect(
      sendContactMail("sender@example.com", "Topic", "Message"),
    ).rejects.toThrow("NODEMAILER_EMAIL");
  });

  it("rejects when the password credential is missing", async () => {
    delete process.env.NODEMAILER_PW;
    await expect(
      sendContactMail("sender@example.com", "Topic", "Message"),
    ).rejects.toThrow("NODEMAILER_PW");
  });

  it("uses the configured recipient and escapes all user-controlled HTML", async () => {
    await sendContactMail(
      'sender+<tag>"\'@example.com',
      "<img src=x onerror=alert(1)>",
      "Hello & goodbye\n<script>alert(1)</script>",
    );

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      port: 465,
      host: "smtp.gmail.com",
      auth: { user: "portfolio@example.com", pass: "test-password" },
      secure: true,
    });
    expect(mockedTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "portfolio@example.com",
        to: "owner@example.com",
        replyTo: 'sender+<tag>"\'@example.com',
        html: expect.not.stringContaining("<script>"),
      }),
    );
    const options = mockedTransporter.sendMail.mock.calls[0][0];
    expect(options.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(options.html).toContain("Hello &amp; goodbye<br />");
    expect(options.html).toContain("&quot;&#39;@example.com");
  });

  it("falls back to the authenticated mailbox as recipient", async () => {
    delete process.env.CONTACT_EMAIL;
    await sendContactMail("sender@example.com", "Topic", "Message");

    expect(mockedTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "portfolio@example.com" }),
    );
  });

  it("awaits and propagates transport errors", async () => {
    mockedTransporter.sendMail.mockRejectedValue(new Error("SMTP failed"));
    await expect(
      sendContactMail("sender@example.com", "Topic", "Message"),
    ).rejects.toThrow("SMTP failed");
  });
});
