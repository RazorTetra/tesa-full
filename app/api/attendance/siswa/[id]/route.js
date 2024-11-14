// app/api/attendance/siswa/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import Attendance from "@/backend/models/attendance";
import Absen from "@/backend/models/absen";
import Siswa from "@/backend/models/siswa";
import TahunAjaran from "@/backend/models/tahunAjaran";

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");
    const tahunAjaran = searchParams.get("tahunAjaran");

    if (!semester || !tahunAjaran) {
      return NextResponse.json(
        { success: false, error: "Semester dan tahun ajaran harus diisi" },
        { status: 400 }
      );
    }

    // Cek siswa
    const siswa = await Siswa.findById(id);
    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    // Dapatkan data tahun ajaran untuk total hari efektif yang benar
    const tahunAjaranData = await TahunAjaran.findOne({
      tahunAjaran,
      semester: parseInt(semester),
    });

    if (!tahunAjaranData) {
      return NextResponse.json(
        { success: false, error: "Data tahun ajaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung total dari absensi aktual
    const absensiDetail = await Absen.find({
      siswaId: id,
      semester: parseInt(semester),
      tahunAjaran,
    });

    const totalHariEfektif = tahunAjaranData.totalHariEfektif;
    const totalHadir = absensiDetail.filter(
      (a) => a.keterangan === "HADIR"
    ).length;
    const totalSakit = absensiDetail.filter(
      (a) => a.keterangan === "SAKIT"
    ).length;
    const totalIzin = absensiDetail.filter(
      (a) => a.keterangan === "IZIN"
    ).length;
    const totalAlpa = absensiDetail.filter(
      (a) => a.keterangan === "ALPA"
    ).length;

    const persentaseKehadiran = (totalHadir / totalHariEfektif) * 100;

    // Update atau create record attendance
    const attendance = await Attendance.findOneAndUpdate(
      {
        siswaId: id,
        semester: parseInt(semester),
        tahunAjaran,
      },
      {
        totalHadir,
        totalSakit,
        totalIzin,
        totalAlpa,
        totalHariEfektif,
        persentaseKehadiran,
      },
      {
        new: true,
        upsert: true,
      }
    ).populate("siswaId", "nama nisn kelas");

    return NextResponse.json({
      success: true,
      data: {
        attendance,
        riwayatAbsensi: absensiDetail,
      },
    });
  } catch (error) {
    console.error("Error in attendance route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
