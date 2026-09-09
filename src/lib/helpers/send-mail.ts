import nodemailer from "nodemailer";

function getMailConfiguration() {
  const sender = process.env.NODEMAILER_EMAIL;
  const password = process.env.NODEMAILER_PW;

  if (!sender) {
    throw new Error("Please set NODEMAILER_EMAIL in .env file");
  }
  if (!password) {
    throw new Error("Please set NODEMAILER_PW in .env file");
  }

  return {
    sender,
    password,
    recipient: process.env.CONTACT_EMAIL || sender,
  };
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  };

  return value.replaceAll(/[&<>'"]/g, (character) => entities[character]);
}

export async function sendContactMail(
  senderEmail: string,
  topic: string,
  message: string,
) {
  const { sender, password, recipient } = getMailConfiguration();
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: { user: sender, pass: password },
    secure: true,
  });

  await transporter.sendMail({
    from: sender,
    to: recipient,
    replyTo: senderEmail,
    subject: "New message from your portfolio site",
    text: `Topic: ${topic}\nSender: ${senderEmail}\n\n${message}`,
    html: `<section>
      <h1>You received the following message from the contact form</h1>
      <h3>${escapeHtml(topic)}</h3>
      <p>${escapeHtml(message).replaceAll(/\r?\n/g, "<br />")}</p>
      <p>The sender's email is: ${escapeHtml(senderEmail)}</p>
    </section>`,
  });
}
