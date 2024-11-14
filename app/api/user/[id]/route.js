// app/api/user/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import User from "@/backend/models/user";
import Siswa from "@/backend/models/siswa";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    // Ekstrak ID dari URL menggunakan URL API
    const id = request.url.split("/").pop();

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  await connectDB();
  try {
    const params = await context.params;
    const body = await request.json();
    
    // Prepare update data
    const updateData = {
      nama: body.nama,
      email: body.email,
      phone: body.phone,
      pengguna: body.pengguna,
      image: body.image || "/noavatar.png",
      imagePublicId: body.imagePublicId
    };

    // If password is provided, hash it
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    // Update user with runValidators to ensure data validity
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika user adalah siswa (pengguna === "user"), update juga data siswa
    if (updatedUser.pengguna === "user") {
      await Siswa.findOneAndUpdate(
        { userId: params.id },
        {
          nama: body.nama, // Sync nama
          image: body.image || "/noavatar.png", // Sync image
          imagePublicId: body.imagePublicId // Sync imagePublicId
        },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  await connectDB();
  try {
    const params = await context.params;
    
    // Cari user yang akan dihapus
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika user adalah siswa, cek dan hapus data siswa jika ada
    if (user.pengguna === "user") {
      const siswa = await Siswa.findOne({ userId: params.id });
      if (siswa) {
        // Hapus foto siswa dari Cloudinary jika bukan default
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
        await Siswa.findByIdAndDelete(siswa._id);
      }
    }

    // Hapus foto user dari Cloudinary jika bukan default
    if (
      user.imagePublicId &&
      user.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
    ) {
      try {
        await cloudinary.uploader.destroy(user.imagePublicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
      }
    }

    // Hapus user
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "User dan data terkait berhasil dihapus"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}