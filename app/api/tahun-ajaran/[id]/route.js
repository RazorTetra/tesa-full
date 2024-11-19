// app/api/tahun-ajaran/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import TahunAjaran from "@/backend/models/tahunAjaran";
import TahunAjaranHistory from "@/backend/models/tahunAjaranHistory";
import Attendance from "@/backend/models/attendance";
import Absen from "@/backend/models/absen";
import Siswa from "@/backend/models/siswa";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    // Jika request untuk mengaktifkan tahun ajaran
    if (body.isActive) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Nonaktifkan semua tahun ajaran lain
        await TahunAjaran.updateMany(
          { _id: { $ne: id } },
          { isActive: false },
          { session }
        );

        // Aktifkan tahun ajaran yang dipilih
        const tahunAjaran = await TahunAjaran.findByIdAndUpdate(
          id,
          { isActive: true },
          { new: true, session }
        );

        if (!tahunAjaran) {
          throw new Error("Tahun ajaran tidak ditemukan");
        }

        // Dapatkan semua siswa yang terdaftar
        const siswaList = await Siswa.find({
          status: {
            $in: ["Siswa", "Siswa Baru", "Siswa Pindahan"],
          },
        });

        console.log(
          `Found ${siswaList.length} students to create attendance records`
        );

        // Buat attendance untuk setiap siswa yang belum memiliki record
        const createAttendancePromises = siswaList.map(async (siswa) => {
          // Cek apakah sudah ada attendance record
          const existingAttendance = await Attendance.findOne({
            siswaId: siswa._id,
            tahunAjaran: tahunAjaran.tahunAjaran,
            semester: tahunAjaran.semester,
          }).session(session);

          // Jika belum ada, buat baru
          if (!existingAttendance) {
            console.log(
              `Creating attendance record for student: ${siswa.nama}`
            );
            return Attendance.create(
              [
                {
                  siswaId: siswa._id,
                  semester: tahunAjaran.semester,
                  tahunAjaran: tahunAjaran.tahunAjaran,
                  totalHadir: 0,
                  totalSakit: 0,
                  totalIzin: 0,
                  totalAlpa: 0,
                  persentaseKehadiran: 0,
                },
              ],
              { session }
            );
          } else {
            console.log(
              `Attendance record already exists for student: ${siswa.nama}`
            );
          }
        });

        // Tunggu semua proses pembuatan attendance selesai
        await Promise.all(createAttendancePromises);

        // Commit transaksi jika semua berhasil
        await session.commitTransaction();

        // Ambil semua attendance records yang dibuat untuk konfirmasi
        const createdRecords = await Attendance.find({
          tahunAjaran: tahunAjaran.tahunAjaran,
          semester: tahunAjaran.semester,
        }).populate("siswaId", "nama nisn kelas");

        return NextResponse.json({
          success: true,
          data: {
            tahunAjaran,
            message: `Berhasil mengaktifkan tahun ajaran ${tahunAjaran.tahunAjaran} semester ${tahunAjaran.semester}`,
            totalSiswa: siswaList.length,
            totalAttendanceRecords: createdRecords.length,
          },
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in tahun ajaran activation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tahunAjaran = await TahunAjaran.findById(id);
      if (!tahunAjaran) {
        return NextResponse.json(
          { success: false, error: "Tahun ajaran tidak ditemukan" },
          { status: 404 }
        );
      }

      if (tahunAjaran.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: "Tidak dapat menghapus tahun ajaran yang sedang aktif",
          },
          { status: 400 }
        );
      }

      // Prepare data for history
      const attendances = await Attendance.find({
        tahunAjaran: tahunAjaran.tahunAjaran,
        semester: tahunAjaran.semester,
      }).populate("siswaId");

      const absens = await Absen.find({
        tahunAjaran: tahunAjaran.tahunAjaran,
        semester: tahunAjaran.semester,
      });

      // Create history record
      const historyData = {
        tahunAjaran: tahunAjaran.tahunAjaran,
        semester: tahunAjaran.semester,
        totalHariEfektif: tahunAjaran.totalHariEfektif,
        tanggalMulai: tahunAjaran.tanggalMulai,
        tanggalSelesai: tahunAjaran.tanggalSelesai,
        attendances: attendances.map((att) => ({
          siswaId: att.siswaId._id,
          totalHadir: att.totalHadir,
          totalSakit: att.totalSakit,
          totalIzin: att.totalIzin,
          totalAlpa: att.totalAlpa,
          persentaseKehadiran: att.persentaseKehadiran,
          absens: absens
            .filter(
              (ab) => ab.siswaId.toString() === att.siswaId._id.toString()
            )
            .map((ab) => ({
              tanggal: ab.tanggal,
              keterangan: ab.keterangan,
              mataPelajaran: ab.mataPelajaran,
            })),
        })),
      };

      await TahunAjaranHistory.create([historyData], { session });

      // Delete related records
      await Attendance.deleteMany(
        {
          tahunAjaran: tahunAjaran.tahunAjaran,
          semester: tahunAjaran.semester,
        },
        { session }
      );

      await Absen.deleteMany(
        {
          tahunAjaran: tahunAjaran.tahunAjaran,
          semester: tahunAjaran.semester,
        },
        { session }
      );

      // Delete tahun ajaran
      await TahunAjaran.findByIdAndDelete(id, { session });

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: "Tahun ajaran berhasil diarsipkan dan dihapus",
      });
    } catch (error) {
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
