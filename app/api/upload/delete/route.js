// app/api/upload/delete/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { publicId } = body;

    console.log('Received publicId:', publicId); // Tambahkan log

    if (!publicId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No public ID provided",
          receivedBody: body // Tambahkan ini untuk debugging
        },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error('Cloudinary delete error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    console.log('Cloudinary delete result:', result); // Tambahkan log

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack // Tambahkan ini untuk debugging
      },
      { status: 500 }
    );
  }
}