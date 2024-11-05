// app/api/siswa/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/database";
import Siswa from "../../../../backend/models/siswa";
import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fungsi untuk menghapus gambar dari Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

export async function DELETE(request, { params }) {
  await connectDB();
  try {
    const siswa = await Siswa.findById(params.id);
    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists and not default
    if (
      siswa.imagePublicId &&
      siswa.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
    ) {
      await deleteFromCloudinary(siswa.imagePublicId);
    }

    // Delete siswa from database
    await Siswa.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Student and associated image successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting siswa:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete student" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  await connectDB();
  try {
    const body = await request.json();
    const currentSiswa = await Siswa.findById(params.id);
    
    if (!currentSiswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // If image is being updated and old image exists
    if (
      body.imagePublicId &&
      currentSiswa.imagePublicId &&
      body.imagePublicId !== currentSiswa.imagePublicId &&
      currentSiswa.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
    ) {
      await deleteFromCloudinary(currentSiswa.imagePublicId);
    }

    const updatedSiswa = await Siswa.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatedSiswa });
  } catch (error) {
    console.error("Error updating siswa:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  await connectDB();
  try {
    const siswa = await Siswa.findById(params.id);
    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: siswa });
  } catch (error) {
    console.error("Error fetching siswa:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}