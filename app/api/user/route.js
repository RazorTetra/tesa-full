// app/api/user/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/backend/config/database";
import User from "@/backend/models/user";
import Siswa from "@/backend/models/siswa";

// Helper untuk koneksi database
const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    const users = await User.find().select("-password");
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectToDatabase();
  let createdUser = null;

  try {
    const body = await request.json();
    const { nama, username, email, password, phone, pengguna, image } = body;

    // Validasi input dasar
    const requiredFields = ["nama", "username", "email", "password", "phone", "pengguna"];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Field berikut harus diisi: ${missingFields.join(", ")}` 
        },
        { status: 400 }
      );
    }

    // Cek apakah username sudah ada
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const userData = {
      nama,
      username,
      email,
      password: hashedPassword,
      phone,
      pengguna,
      image: image || "/noavatar.png",
    };

    // Jika ini pembuatan user untuk siswa (dari form siswa)
    if (body.isSiswa) {
      const { nisn, kelas, alamat, status } = body;
      
      // Validasi tambahan untuk siswa
      if (!nisn || !kelas || !alamat || !status) {
        return NextResponse.json(
          { success: false, error: "Data siswa tidak lengkap" },
          { status: 400 }
        );
      }

      // Buat user
      createdUser = await User.create(userData);

      // Buat data siswa
      const siswaData = {
        nama,
        nisn,
        kelas,
        alamat,
        status,
        image: image || "/noavatar.png",
        userId: createdUser._id,
      };

      const siswa = await Siswa.create(siswaData);

      return NextResponse.json({
        success: true,
        data: siswa,
        credentials: {
          username,
          password: password, // Password asli untuk ditampilkan sekali
          email
        }
      }, { status: 201 });
    }

    // Untuk pembuatan user biasa
    createdUser = await User.create(userData);
    const userResponse = { ...createdUser.toObject() };
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse
    }, { status: 201 });

  } catch (error) {
    // Cleanup jika terjadi error
    if (createdUser) {
      try {
        await User.findByIdAndDelete(createdUser._id);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Gagal membuat user: ${error.message}` 
      },
      { status: 500 }
    );
  }
}