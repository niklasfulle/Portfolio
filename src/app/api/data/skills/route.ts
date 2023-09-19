import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db/prisma";
import { getUserWithouPassword } from "@/lib/db/user-functions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
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

    const last = await db.skills.findMany({
      orderBy: {
        series: "desc"
      },
      take: 1
    })

    let series;

    if (last.length === 0) {
      series = 1
    } else {
      series = last[0].series + 1
    }

    const body: any = await req.json();

    await db.skills.create({
      data: {
        name: body.data.name,
        type: body.data.type,
        visible: true,
        series: series
      }
    })

    return NextResponse.json({ message: "Skill created succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, success: false }, { status: 400 })
  }
}

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

    await db.skills.update({
      where: {
        id: body.data.id
      },
      data: {
        name: body.data.name,
      }
    })

    return NextResponse.json({ message: "Skill updated succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, success: false }, { status: 400 })
  }
}

export async function DELETE(
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

    await db.skills.delete({
      where: {
        id: body.id
      },

    })

    return NextResponse.json({ message: "Skill updated succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, success: false }, { status: 400 })
  }
}