import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import User from "../../../backend/models/user";

const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    const users = await User.find();
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
    const { nama, nisn, kelas, alamat, status, image } = body;

    // Validasi input
    const requiredFields = ["nama", "nisn", "kelas", "alamat", "status"];
    if (requiredFields.some((field) => !body[field])) {
      return NextResponse.json(
        { success: false, error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Generate kredensial
    const username = `siswa${nisn}`;
    const password = nisn.toString(); // Pastikan NISN dalam bentuk string

    // Hash password dengan bcrypt (pastikan salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const userData = {
      nama,
      username,
      email: `${username}@smpadventtompaso.com`,
      password: hashedPassword, // Password yang sudah di-hash
      phone: "000000000000",
      pengguna: "user",
      image: image || "/noavatar.png",
    };

    // Simpan user
    const user = new User(userData);
    createdUser = await user.save();

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

    // Simpan siswa
    const siswa = new Siswa(siswaData);
    const savedSiswa = await siswa.save();

    // Kembalikan respons dengan kredensial yang benar
    return NextResponse.json(
      {
        success: true,
        data: savedSiswa,
        credentials: {
          username,
          password, // Password asli (sebelum di-hash)
          email: userData.email,
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
        console.error("Cleanup error:", cleanupError);
      }
    }

    return NextResponse.json(
      { success: false, error: "Gagal membuat akun siswa" },
      { status: 500 }
    );
  }
}
