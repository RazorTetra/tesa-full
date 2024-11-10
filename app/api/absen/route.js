// app/api/absen/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import Absen from "@/backend/models/absen";
import Siswa from "@/backend/models/siswa";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const today = searchParams.get("today");
    const kelas = searchParams.get("kelas");
    const tanggal = searchParams.get("tanggal");
    const tahunAjaran = searchParams.get("tahunAjaran");
    const semester = searchParams.get("semester");

    let query = {};

    // Filter tahun ajaran & semester
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    if (semester) query.semester = parseInt(semester);

    // Filter today
    if (today === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      query.tanggal = {
        $gte: today,
        $lt: tomorrow
      };
    }

    // Filter kelas
    if (kelas) query.kelas = kelas;

    // Filter tanggal spesifik
    if (tanggal) {
      const specificDate = new Date(tanggal);
      specificDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(specificDate);
      nextDate.setDate(nextDate.getDate() + 1);

      query.tanggal = {
        $gte: specificDate,
        $lt: nextDate
      };
    }

    const absensi = await Absen.find(query)
      .populate("siswaId", "nama nisn kelas")
      .sort({ tanggal: -1 });

    return NextResponse.json({ success: true, data: absensi });
  } catch (error) {
    console.error("Error in absen route:", error);
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

    // Validasi input
    const requiredFields = [
      "siswaId",
      "tanggal",
      "kelas",
      "keterangan",
      "mataPelajaran",
      "semester",
      "tahunAjaran",
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

    // Cek siswa
    const siswa = await Siswa.findById(body.siswaId);
    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    // Format tanggal
    const tanggal = new Date(body.tanggal);
    tanggal.setHours(0, 0, 0, 0);

    // Cek duplikasi
    const existingAbsen = await Absen.findOne({
      siswaId: body.siswaId,
      tanggal,
      mataPelajaran: body.mataPelajaran.toUpperCase()
    });

    if (existingAbsen) {
      return NextResponse.json(
        {
          success: false,
          error: `Absensi untuk mata pelajaran ${body.mataPelajaran} pada tanggal tersebut sudah ada`,
        },
        { status: 400 }
      );
    }

    // Buat absensi baru
    const absen = await Absen.create({
      siswaId: body.siswaId,
      tanggal,
      kelas: body.kelas,
      keterangan: body.keterangan.toUpperCase(),
      mataPelajaran: body.mataPelajaran.toUpperCase(),
      semester: parseInt(body.semester),
      tahunAjaran: body.tahunAjaran,
    });

    const populatedAbsen = await Absen.findById(absen._id)
      .populate("siswaId", "nama nisn kelas");

    return NextResponse.json({ success: true, data: populatedAbsen });
  } catch (error) {
    console.error("Error in absen route:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: Object.values(error.errors).map(err => err.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal membuat absensi" },
      { status: 500 }
    );
  }
}