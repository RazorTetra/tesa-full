// app/api/absen/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import Absen from "@/backend/models/absen";
import Attendance from "@/backend/models/attendance";
import TahunAjaran from "@/backend/models/tahunAjaran";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const absen = await Absen.findById(id)
      .populate("siswaId", "nama nisn kelas");

    if (!absen) {
      return NextResponse.json(
        { success: false, error: "Absen tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: absen });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Dapatkan data absen lama
      const oldAbsen = await Absen.findById(id);
      if (!oldAbsen) {
        return NextResponse.json(
          { success: false, error: "Absen tidak ditemukan" },
          { status: 404 }
        );
      }

      // 2. Update absen
      const updatedAbsen = await Absen.findByIdAndUpdate(
        id,
        {
          keterangan: body.keterangan.toUpperCase(),
          mataPelajaran: body.mataPelajaran?.toUpperCase(),
          tanggal: body.tanggal ? new Date(body.tanggal) : oldAbsen.tanggal,
        },
        { new: true, session }
      );

      // 3. Recalculate attendance
      const absenList = await Absen.find({
        siswaId: oldAbsen.siswaId,
        semester: oldAbsen.semester,
        tahunAjaran: oldAbsen.tahunAjaran
      }, null, { session });

      const tahunAjaranData = await TahunAjaran.findOne({
        tahunAjaran: oldAbsen.tahunAjaran,
        semester: oldAbsen.semester
      }, null, { session });

      if (!tahunAjaranData) {
        throw new Error("Tahun ajaran tidak ditemukan");
      }

      // 4. Update attendance counts
      const totalHadir = absenList.filter(a => a.keterangan === 'HADIR').length;
      const totalSakit = absenList.filter(a => a.keterangan === 'SAKIT').length;
      const totalIzin = absenList.filter(a => a.keterangan === 'IZIN').length;
      const totalAlpa = absenList.filter(a => a.keterangan === 'ALPA').length;

      const persentaseKehadiran = 
        (totalHadir / tahunAjaranData.totalHariEfektif) * 100;

      await Attendance.findOneAndUpdate(
        {
          siswaId: oldAbsen.siswaId,
          semester: oldAbsen.semester,
          tahunAjaran: oldAbsen.tahunAjaran
        },
        {
          totalHadir,
          totalSakit,
          totalIzin,
          totalAlpa,
          persentaseKehadiran: Math.round(persentaseKehadiran * 100) / 100
        },
        { session }
      );

      await session.commitTransaction();

      return NextResponse.json({ 
        success: true, 
        data: updatedAbsen 
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get absen data before deletion
      const absen = await Absen.findById(id);
      if (!absen) {
        return NextResponse.json(
          { success: false, error: "Absen tidak ditemukan" },
          { status: 404 }
        );
      }

      // 2. Delete the absen
      await Absen.findByIdAndDelete(id, { session });

      // 3. Recalculate attendance
      const remainingAbsen = await Absen.find({
        siswaId: absen.siswaId,
        semester: absen.semester,
        tahunAjaran: absen.tahunAjaran
      }, null, { session });

      const tahunAjaranData = await TahunAjaran.findOne({
        tahunAjaran: absen.tahunAjaran,
        semester: absen.semester
      }, null, { session });

      if (!tahunAjaranData) {
        throw new Error("Tahun ajaran tidak ditemukan");
      }

      // 4. Update attendance counts
      const totalHadir = remainingAbsen.filter(a => a.keterangan === 'HADIR').length;
      const totalSakit = remainingAbsen.filter(a => a.keterangan === 'SAKIT').length;
      const totalIzin = remainingAbsen.filter(a => a.keterangan === 'IZIN').length;
      const totalAlpa = remainingAbsen.filter(a => a.keterangan === 'ALPA').length;

      const persentaseKehadiran = 
        (totalHadir / tahunAjaranData.totalHariEfektif) * 100;

      await Attendance.findOneAndUpdate(
        {
          siswaId: absen.siswaId,
          semester: absen.semester,
          tahunAjaran: absen.tahunAjaran
        },
        {
          totalHadir,
          totalSakit,
          totalIzin,
          totalAlpa,
          persentaseKehadiran: Math.round(persentaseKehadiran * 100) / 100
        },
        { session }
      );

      await session.commitTransaction();

      return NextResponse.json({ 
        success: true, 
        message: "Absen berhasil dihapus" 
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}