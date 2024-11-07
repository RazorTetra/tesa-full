// app/api/siswa/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/database";
import Siswa from "../../../../backend/models/siswa";
import User from "../../../../backend/models/user";
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

export async function GET(request, context) {
  await connectDB();
  try {
    const params = await context.params;
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

export async function PUT(request, context) {
  await connectDB();
  try {
    const params = await context.params;
    const body = await request.json();
    
    const currentSiswa = await Siswa.findById(params.id);
    if (!currentSiswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Update image jika ada perubahan
    if (
      body.imagePublicId &&
      currentSiswa.imagePublicId &&
      body.imagePublicId !== currentSiswa.imagePublicId &&
      currentSiswa.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
    ) {
      await deleteFromCloudinary(currentSiswa.imagePublicId);
    }

    // Update siswa
    const updatedSiswa = await Siswa.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );

    // Jika ada userId, update juga data user yang terkait
    if (currentSiswa.userId) {
      await User.findByIdAndUpdate(
        currentSiswa.userId,
        {
          nama: body.nama, // Sync nama
          image: body.image || "/noavatar.png", // Sync image
          imagePublicId: body.imagePublicId // Sync imagePublicId
        },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, data: updatedSiswa });
  } catch (error) {
    console.error("Error updating siswa:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  await connectDB();
  try {
    const params = await context.params;

    // Cari siswa yang akan dihapus
    const siswa = await Siswa.findById(params.id);
    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus foto dari Cloudinary jika bukan default
    if (
      siswa.imagePublicId &&
      siswa.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
    ) {
      try {
        await cloudinary.uploader.destroy(siswa.imagePublicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
      }
    }

    // Hapus user terkait jika ada
    if (siswa.userId) {
      const user = await User.findById(siswa.userId);
      if (user) {
        // Hapus foto user dari Cloudinary jika berbeda dengan foto siswa
        if (
          user.imagePublicId &&
          user.imagePublicId !== siswa.imagePublicId &&
          user.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
        ) {
          try {
            await cloudinary.uploader.destroy(user.imagePublicId);
          } catch (cloudinaryError) {
            console.error("Cloudinary delete error:", cloudinaryError);
          }
        }
        await User.findByIdAndDelete(siswa.userId);
      }
    }

    // Hapus siswa
    await Siswa.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Siswa dan akun terkait berhasil dihapus"
    });
  } catch (error) {
    console.error("Error deleting siswa:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}