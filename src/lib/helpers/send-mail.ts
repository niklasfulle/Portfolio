import nodemailer from 'nodemailer';



function envCheck() {
  if (!process.env.NODEMAILER_EMAIL) {
    throw new Error('Please set NODEMAILER_EMAIL in .env file');
  } else if (!process.env.NODEMAILER_PW) {
    throw new Error('Please set NODEMAILER_PW in .env file');
  }
}

export async function sendContactMail(contactEmail: string, senderEmail: string, topic: string, message: string) {
  try {
    envCheck();

    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PW,
      },
      secure: true,
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: contactEmail,
      subject: "New message from your portfolio site",
      text: `${message}`,
      html: `<section>
              <h1>
                You received the following message from the contact form
              </h1>
              <h3>${topic}</h3>
              <p>${message}</p>
              <br />
              <p>The sender's email is: ${senderEmail}</p>
            </section>`,
    };

    transporter.sendMail(mailOptions, function (error: any) {
      if (error) {
        throw new Error(error);
      } else {
        return true;
      }
    });
  } catch (error: any) {
    throw new Error(error);
  }
}

