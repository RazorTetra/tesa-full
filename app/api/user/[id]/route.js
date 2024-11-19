// app/api/user/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import User from "@/backend/models/user";
import Siswa from "@/backend/models/siswa";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await User.findById(params.id).select("-password");

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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();

    // Validasi email jika diupdate
    if (body.email) {
      const emailRegex = /.+\@.+\..+/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: "Format email tidak valid" },
          { status: 400 }
        );
      }
    }

    // Start session untuk transaksi
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Prepare update data
      const updateData = {
        nama: body.nama,
        email: body.email,
        phone: body.phone,
        pengguna: body.pengguna,
      };

      // Handle image update
      if (body.image) {
        updateData.image = body.image;
        updateData.imagePublicId = body.imagePublicId;
      }

      // If password is provided, hash it
      if (body.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(body.password, salt);
      }

      // Get current user data for cleanup
      const currentUser = await User.findById(params.id);
      if (!currentUser) {
        throw new Error("User tidak ditemukan");
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(params.id, updateData, {
        new: true,
        runValidators: true,
        session,
      }).select("-password");

      // Jika user adalah siswa, update juga data siswa
      if (updatedUser.pengguna === "user") {
        const siswaUpdateData = {
          nama: body.nama,
        };

        if (body.image) {
          siswaUpdateData.image = body.image;
          siswaUpdateData.imagePublicId = body.imagePublicId;
        }

        await Siswa.findOneAndUpdate({ userId: params.id }, siswaUpdateData, {
          session,
        });
      }

      // Cleanup old image if new image uploaded
      if (
        body.image &&
        currentUser.imagePublicId &&
        currentUser.imagePublicId !== "tesa_skripsi/defaults/no-avatar" &&
        currentUser.imagePublicId !== body.imagePublicId
      ) {
        await cloudinary.uploader.destroy(currentUser.imagePublicId);
      }

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    // Start session untuk transaksi
    const session = await User.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(params.id);
      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      // Handle siswa deletion
      if (user.pengguna === "user") {
        const siswa = await Siswa.findOne({ userId: params.id });
        if (siswa) {
          if (
            siswa.imagePublicId &&
            siswa.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
          ) {
            await cloudinary.uploader.destroy(siswa.imagePublicId);
          }
          await Siswa.findByIdAndDelete(siswa._id, { session });
        }
      }

      // Handle user image cleanup
      if (
        user.imagePublicId &&
        user.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
      ) {
        await cloudinary.uploader.destroy(user.imagePublicId);
      }

      // Delete user
      await User.findByIdAndDelete(params.id, { session });

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: "User dan data terkait berhasil dihapus",
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
