import { authOptions } from "@/lib/auth/auth";
import { getUserWithouPassword } from "@/lib/db/user-functions";
import { writeFile } from "fs/promises";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({
    error: 'Unauthorized to perform this action.', success: false
  }, { status: 401 })

  const user = await getUserWithouPassword(session?.user?.email)

  if (!user || user.role !== "admin") return NextResponse.json({
    error: 'Unauthorized to perform this action.', success: false
  }, { status: 401 })

  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;
  const title: string | null = data.get("title") as string | null;

  const fileName = title?.toLocaleLowerCase() + Date.now().toString() + file.type.replace("image/", ".");

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // With the file data in the buffer, you can do whatever you want with it.
  // For this, we'll just write it to the filesystem in a new location
  const path = `${process.cwd()}/public/images/${fileName}`;
  await writeFile(path, buffer);

  return NextResponse.json({ success: true, fileName: fileName });
}