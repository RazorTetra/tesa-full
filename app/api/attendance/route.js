// app/api/attendance/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import Attendance from "../../../backend/models/attendance";
import Siswa from "../../../backend/models/siswa";
import TahunAjaran from "../../../backend/models/tahunAjaran";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");
    const tahunAjaran = searchParams.get("tahunAjaran");
    const kelas = searchParams.get("kelas");
    const siswaId = searchParams.get("siswaId");

    let query = {};
    
    if (semester && tahunAjaran) {
      query.semester = parseInt(semester);
      query.tahunAjaran = tahunAjaran;
    }

    if (kelas) {
      const siswa = await Siswa.find({ kelas });
      const siswaIds = siswa.map(s => s._id);
      query.siswaId = { $in: siswaIds };
    }

    if (siswaId) {
      query.siswaId = siswaId;
    }

    const attendance = await Attendance.find(query)
      .populate('siswaId', 'nama nisn kelas');

    return NextResponse.json({ 
      success: true, 
      data: attendance 
    });

  } catch (error) {
    console.error('Error in attendance route:', error);
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
    const { 
      siswaId, 
      semester, 
      tahunAjaran,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa
    } = body;

    if (!siswaId || !semester || !tahunAjaran) {
      return NextResponse.json(
        { success: false, error: "Mohon lengkapi semua field yang dibutuhkan" },
        { status: 400 }
      );
    }

    // Cek tahun ajaran aktif
    const tahunAjaranData = await TahunAjaran.findOne({
      tahunAjaran,
      semester: parseInt(semester),
      isActive: true
    });

    if (!tahunAjaranData) {
      return NextResponse.json(
        { success: false, error: "Tahun ajaran tidak aktif atau tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung persentase kehadiran
    const persentaseKehadiran = 
      (totalHadir / tahunAjaranData.totalHariEfektif) * 100;

    const attendance = await Attendance.findOneAndUpdate(
      { siswaId, semester, tahunAjaran },
      {
        totalHadir: totalHadir || 0,
        totalSakit: totalSakit || 0,
        totalIzin: totalIzin || 0,
        totalAlpa: totalAlpa || 0,
        persentaseKehadiran: Math.round(persentaseKehadiran * 100) / 100
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    ).populate('siswaId', 'nama nisn kelas');

    return NextResponse.json({ success: true, data: attendance });

  } catch (error) {
    console.error('Error in attendance route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}