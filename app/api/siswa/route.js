// app/api/siswa/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import Siswa from "../../../backend/models/siswa";
import User from "../../../backend/models/user";
import bcrypt from "bcryptjs";

// Pastikan koneksi database
const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    // Gunakan lean() untuk performa lebih baik
    const siswa = await Siswa.find()
      .select("-__v")
      .populate({
        path: "userId",
        select: "nama username email phone pengguna image -_id",
      })
      .lean();

    return NextResponse.json({ success: true, data: siswa });
  } catch (error) {
    console.error("Error fetching siswa:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data siswa" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectToDatabase();
  let createdUser = null;

  try {
    const body = await request.json();
    const { nama, nisn, kelas, alamat, status, image } = body;

    // Validasi input
    const requiredFields = ["nama", "nisn", "kelas", "alamat", "status"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Data berikut harus diisi: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Cek NISN duplikat
    const existingSiswa = await Siswa.findOne({ nisn }).lean();
    if (existingSiswa) {
      return NextResponse.json(
        { success: false, error: "NISN sudah terdaftar" },
        { status: 400 }
      );
    }

    // Persiapkan kredensial
    const username = `siswa${nisn}`;
    const rawPassword = nisn.toString(); // Password asli untuk ditampilkan ke user
    const email = `${username}@smpadventtompaso.com`;

    // Cek username duplikat
    const existingUser = await User.findOne({ username }).lean();
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Username sudah terdaftar" },
        { status: 400 }
      );
    }

    // Buat user baru - PENTING: Jangan hash password manual, biarkan schema User yang melakukannya
    const userData = {
      nama,
      username,
      email,
      password: rawPassword, // Password akan di-hash oleh pre-save hook di model User
      phone: "000000000000",
      pengguna: "user",
      image: image || "/noavatar.png",
    };

    // Simpan user - password akan di-hash otomatis oleh pre-save hook
    const user = new User(userData);
    createdUser = await user.save();

    console.log("User created with credentials:", {
      username,
      passwordBeforeHash: rawPassword,
      email,
    });

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

    const siswa = new Siswa(siswaData);
    const savedSiswa = await siswa.save();

    // Populate data untuk response
    const populatedSiswa = await Siswa.findById(savedSiswa._id)
      .populate("userId", "-password -__v")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedSiswa,
        user: {
          username,
          password: rawPassword, // Kirim password asli untuk ditampilkan ke user
          email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Cleanup jika terjadi error
    if (createdUser) {
      try {
        await User.findByIdAndDelete(createdUser._id);
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    }

    console.error("Error creating siswa:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.code === 11000
            ? "Data yang dimasukkan sudah ada dalam sistem"
            : "Gagal membuat data siswa",
      },
      { status: 500 }
    );
  }
}
