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
    const { text1, text2, text3, text4 } = body;

    await db.aboutMe.update({
      where: { id: "1" },
      data: {
        text: text1,
      }
    });
    await db.aboutMe.update({
      where: { id: "2" },
      data: {
        text: text2,
      }
    });
    await db.aboutMe.update({
      where: { id: "3" },
      data: {
        text: text3,
      }
    });
    await db.aboutMe.update({
      where: { id: "4" },
      data: {
        text: text4,
      }
    });
    return NextResponse.json({ message: "About updated succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
  }
}