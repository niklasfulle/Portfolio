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

    const body: any = await req.json();


    const project = await db.projects.create({
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        url: body.url,
        tags: body.tags,
        visible: true,
        series: Number(body.series)
      }
    })

    return NextResponse.json({ message: "Project created succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
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

    const project = await db.projects.update({
      where: {
        id: body.id
      },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        url: body.link,
        tags: body.tags,
        visible: true,
        series: Number(body.series)
      }
    })

    return NextResponse.json({ message: "Project updated succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
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

    await db.projects.delete({
      where: {
        id: body.id
      }
    })

    return NextResponse.json({ message: "Project delete succsesful", success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
  }
}