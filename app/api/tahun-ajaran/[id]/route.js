// app/api/tahun-ajaran/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import TahunAjaran from "@/backend/models/tahunAjaran";
import Absen from "@/backend/models/absen";
import Attendance from "@/backend/models/attendance";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    // Validasi format tahun ajaran jika ada update
    if (body.tahunAjaran && !/^\d{4}\/\d{4}$/.test(body.tahunAjaran)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format tahun ajaran tidak valid. Gunakan format: 2023/2024",
        },
        { status: 400 }
      );
    }

    // Validasi tanggal jika ada update
    if (body.tanggalMulai && body.tanggalSelesai) {
      const tanggalMulai = new Date(body.tanggalMulai);
      const tanggalSelesai = new Date(body.tanggalSelesai);

      if (tanggalMulai >= tanggalSelesai) {
        return NextResponse.json(
          {
            success: false,
            error: "Tanggal mulai harus lebih awal dari tanggal selesai",
          },
          { status: 400 }
        );
      }
    }

    // Validasi total hari efektif jika ada update
    if (body.totalHariEfektif !== undefined && body.totalHariEfektif < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Total hari efektif minimal 1",
        },
        { status: 400 }
      );
    }

    const tahunAjaran = await TahunAjaran.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!tahunAjaran) {
      return NextResponse.json(
        { success: false, error: "Tahun ajaran tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tahunAjaran });
  } catch (error) {
    console.error("Error in tahun ajaran update route:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Tahun ajaran sudah ada",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete tahun ajaran
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // Cek keberadaan tahun ajaran
    const tahunAjaran = await TahunAjaran.findById(id);
    if (!tahunAjaran) {
      return NextResponse.json(
        { success: false, error: "Tahun ajaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah tahun ajaran sedang aktif
    if (tahunAjaran.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Tidak dapat menghapus tahun ajaran yang sedang aktif",
        },
        { status: 400 }
      );
    }

    // Cek apakah ada data absensi yang terkait
    const absenCount = await Absen.countDocuments({
      tahunAjaran: tahunAjaran.tahunAjaran,
    });

    if (absenCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tidak dapat menghapus tahun ajaran yang memiliki data absensi",
        },
        { status: 400 }
      );
    }

    // Cek apakah ada data attendance yang terkait
    const attendanceCount = await Attendance.countDocuments({
      tahunAjaran: tahunAjaran.tahunAjaran,
    });

    if (attendanceCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tidak dapat menghapus tahun ajaran yang memiliki data kehadiran",
        },
        { status: 400 }
      );
    }

    // Hapus tahun ajaran
    await TahunAjaran.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Tahun ajaran berhasil dihapus",
    });
  } catch (error) {
    console.error("Error in tahun ajaran delete route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
