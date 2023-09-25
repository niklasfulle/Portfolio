import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {
  try {

    const body: any = await req.json();

    return NextResponse.json({ message: "Project created succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, success: false }, { status: 400 })
  }
}