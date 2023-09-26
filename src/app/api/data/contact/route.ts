import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db/prisma";
import { getUserWithouPassword } from "@/lib/db/user-functions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) return NextResponse.json({
      error: 'Unauthorized to perform this action.', success: false
    }, { status: 401 })

    const user = await getUserWithouPassword(session?.user?.email)

    if (!user || user.role !== "admin") return NextResponse.json({
      error: 'Unauthorized to perform this action.', success: false
    }, { status: 401 })

    const body: any = await req.json();

    await db.contactEmail.update({
      where: {
        id: body.id
      },
      data: {
        email: body.email,
      }
    })

    return NextResponse.json({ message: "Experience updated succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, success: false }, { status: 400 })
  }
}