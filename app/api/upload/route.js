// app/api/upload/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const entityType = formData.get("entityType") || "misc";
    const entityId = formData.get("entityId") || Date.now().toString();

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert file untuk upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString("base64");
    const base64File = `data:${file.type};base64,${base64String}`;

    // Upload ke Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64File,
        {
          folder: `tesa_skripsi/${entityType}/${entityId}`,
          resource_type: "auto",
          public_id: `profile_${Date.now()}`,
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    console.log("Upload result:", uploadResult); // Tambahkan log

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error("Failed to get upload URL");
    }

    return NextResponse.json({
      success: true,
      fileName: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      uploadResult, // Tambahkan ini untuk debugging
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
