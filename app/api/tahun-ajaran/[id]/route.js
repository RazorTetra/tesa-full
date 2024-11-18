// app/api/tahun-ajaran/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import TahunAjaran from "@/backend/models/tahunAjaran";
import Attendance from "@/backend/models/attendance";
import Siswa from "@/backend/models/siswa";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    // Jika request untuk mengaktifkan tahun ajaran
    if (body.isActive) {
      // Start transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Nonaktifkan semua tahun ajaran lain
        await TahunAjaran.updateMany(
          { _id: { $ne: id } },
          { isActive: false },
          { session }
        );

        // Aktifkan tahun ajaran yang dipilih menggunakan findOneAndUpdate
        const tahunAjaran = await TahunAjaran.findByIdAndUpdate(
          id,
          { isActive: true },
          { new: true, session }
        );

        if (!tahunAjaran) {
          throw new Error("Tahun ajaran tidak ditemukan");
        }

        // Dapatkan semua siswa aktif
        const siswaList = await Siswa.find({ status: "Aktif" });

        // Buat attendance baru untuk setiap siswa dengan nilai awal 0
        const attendancePromises = siswaList.map(siswa => {
          return Attendance.create([{
            siswaId: siswa._id,
            semester: tahunAjaran.semester,
            tahunAjaran: tahunAjaran.tahunAjaran,
            totalHadir: 0,
            totalSakit: 0,
            totalIzin: 0,
            totalAlpa: 0,
            totalHariEfektif: tahunAjaran.totalHariEfektif,
            persentaseKehadiran: 0
          }], { session });
        });

        await Promise.all(attendancePromises);
        await session.commitTransaction();

        return NextResponse.json({ 
          success: true, 
          data: tahunAjaran,
          message: `Berhasil mengaktifkan tahun ajaran dan membuat data kehadiran baru untuk ${siswaList.length} siswa`
        });

      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Invalid request" 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in tahun ajaran update route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// app/api/tahun-ajaran/[id]/route.js
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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

      // Hapus semua attendance yang terkait
      await Attendance.deleteMany(
        {
          tahunAjaran: tahunAjaran.tahunAjaran,
          semester: tahunAjaran.semester,
        },
        { session }
      );

      // Hapus semua absensi yang terkait
      await Absen.deleteMany(
        {
          tahunAjaran: tahunAjaran.tahunAjaran,
          semester: tahunAjaran.semester,
        },
        { session }
      );

      // Hapus tahun ajaran
      await TahunAjaran.findByIdAndDelete(id, { session });

      // Commit transaction
      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: "Tahun ajaran dan semua data terkait berhasil dihapus",
      });
    } catch (error) {
      // Rollback jika terjadi error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error in tahun ajaran delete route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
