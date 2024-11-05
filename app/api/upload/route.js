import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file uploaded" },
      { status: 400 },
    );
  }

  const filePath = path.join(process.cwd(), "public/uploads", file.name);
  const fileData = Buffer.from(await file.arrayBuffer());

  try {
    await fs.writeFile(filePath, fileData);
    return NextResponse.json({
      success: true,
      fileName: `/uploads/${file.name}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Error uploading file" },
      { status: 500 },
    );
  }
}
