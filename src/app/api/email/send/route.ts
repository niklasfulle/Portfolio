import { sendContactMail } from "@/lib/helpers/send-mail";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {
  try {
    const body: any = await req.json();

    await sendContactMail(body.contactEmail, body.senderEmail, body.topic, body.message);

    return NextResponse.json({ message: "Message was send succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, success: false }, { status: 400 })
  }
}