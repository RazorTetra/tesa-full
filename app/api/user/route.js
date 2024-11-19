// app/api/user/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/backend/config/database";
import User from "@/backend/models/user";
import Siswa from "@/backend/models/siswa";

export async function GET(request) {
  try {
    await connectDB();
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
  try {
    await connectDB();
    const body = await request.json();
    const { nama, username, email, password, phone, pengguna, image } = body;

    // Validasi input dasar
    const requiredFields = [
      "nama",
      "username",
      "email",
      "password",
      "phone",
      "pengguna",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Field berikut harus diisi: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /.+\@.+\..+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Cek duplikasi username dan email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            existingUser.username === username
              ? "Username sudah digunakan"
              : "Email sudah digunakan",
        },
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
      imagePublicId: "tesa_skripsi/defaults/no-avatar",
    };

    // Jika ini pembuatan user untuk siswa
    if (body.isSiswa) {
      const { nisn, kelas, alamat, status } = body;

      // Validasi tambahan untuk siswa
      if (!nisn || !kelas || !alamat || !status) {
        return NextResponse.json(
          { success: false, error: "Data siswa tidak lengkap" },
          { status: 400 }
        );
      }

      // Cek duplikasi NISN
      const existingSiswa = await Siswa.findOne({ nisn });
      if (existingSiswa) {
        return NextResponse.json(
          { success: false, error: "NISN sudah terdaftar" },
          { status: 400 }
        );
      }

      // Start session untuk transaksi
      const session = await User.startSession();
      session.startTransaction();

      try {
        // Buat user
        const createdUser = await User.create([userData], { session });

        // Buat data siswa
        const siswaData = {
          nama,
          nisn,
          kelas,
          alamat,
          status,
          image: image || "/noavatar.png",
          imagePublicId: "tesa_skripsi/defaults/no-avatar",
          userId: createdUser[0]._id,
        };

        const siswa = await Siswa.create([siswaData], { session });
        await session.commitTransaction();

        return NextResponse.json(
          {
            success: true,
            data: siswa[0],
            credentials: {
              username,
              password, // Password asli untuk ditampilkan sekali
              email,
            },
          },
          { status: 201 }
        );
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    // Untuk pembuatan user biasa
    const createdUser = await User.create(userData);
    const userResponse = { ...createdUser.toObject() };
    delete userResponse.password;

    return NextResponse.json(
      {
        success: true,
        data: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
