// app/api/attendance/rekap/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import Attendance from "@/backend/models/attendance";
import Absen from "@/backend/models/absen";
import Siswa from "@/backend/models/siswa";
import TahunAjaran from "@/backend/models/tahunAjaran";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");
    const tahunAjaran = searchParams.get("tahunAjaran");
    const kelas = searchParams.get("kelas");

    // Validasi input
    if (!semester || !tahunAjaran) {
      return NextResponse.json(
        { success: false, error: "Semester dan tahun ajaran harus diisi" },
        { status: 400 }
      );
    }

    // Dapatkan data tahun ajaran untuk total hari efektif
    const tahunAjaranData = await TahunAjaran.findOne({
      tahunAjaran,
      semester: parseInt(semester)
    });

    if (!tahunAjaranData) {
      return NextResponse.json(
        { success: false, error: "Data tahun ajaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const totalHariEfektif = tahunAjaranData.totalHariEfektif;

    // Base query untuk siswa
    let siswaQuery = {};
    if (kelas) {
      siswaQuery.kelas = kelas;
    }

    // Dapatkan semua siswa
    const siswaList = await Siswa.find(siswaQuery);

    // Dapatkan rekap kehadiran untuk semua siswa
    const rekapKehadiran = await Promise.all(
      siswaList.map(async (siswa) => {
        // Ambil semua absensi siswa untuk semester dan tahun ajaran ini
        const absensiDetail = await Absen.find({
          siswaId: siswa._id,
          semester: parseInt(semester),
          tahunAjaran
        });

        // Hitung total untuk setiap jenis kehadiran
        const totalHadir = absensiDetail.filter(a => a.keterangan === 'HADIR').length;
        const totalSakit = absensiDetail.filter(a => a.keterangan === 'SAKIT').length;
        const totalIzin = absensiDetail.filter(a => a.keterangan === 'IZIN').length;
        const totalAlpa = absensiDetail.filter(a => a.keterangan === 'ALPA').length;

        // Hitung persentase berdasarkan total hari efektif
        const persentaseKehadiran = totalHariEfektif > 0 
          ? (totalHadir / totalHariEfektif) * 100 
          : 0;

        // Update atau create record attendance
        await Attendance.findOneAndUpdate(
          {
            siswaId: siswa._id,
            semester: parseInt(semester),
            tahunAjaran
          },
          {
            totalHadir,
            totalSakit,
            totalIzin,
            totalAlpa,
            persentaseKehadiran: Math.round(persentaseKehadiran * 100) / 100
          },
          { upsert: true }
        );

        return {
          siswa: {
            id: siswa._id,
            nama: siswa.nama,
            nisn: siswa.nisn,
            kelas: siswa.kelas
          },
          kehadiran: {
            hadir: totalHadir,
            sakit: totalSakit,
            izin: totalIzin,
            alpa: totalAlpa,
            totalHariEfektif,
            persentase: persentaseKehadiran.toFixed(2)
          }
        };
      })
    );

    // Hitung statistik per kelas
    const statistikKelas = {};
    rekapKehadiran.forEach((rekap) => {
      const kelas = rekap.siswa.kelas;
      if (!statistikKelas[kelas]) {
        statistikKelas[kelas] = {
          totalSiswa: 0,
          rataRataKehadiran: 0,
          totalHariEfektif,
          detailKehadiran: {
            hadir: 0,
            sakit: 0,
            izin: 0,
            alpa: 0
          }
        };
      }

      statistikKelas[kelas].totalSiswa++;
      statistikKelas[kelas].rataRataKehadiran += parseFloat(rekap.kehadiran.persentase);
      statistikKelas[kelas].detailKehadiran.hadir += rekap.kehadiran.hadir;
      statistikKelas[kelas].detailKehadiran.sakit += rekap.kehadiran.sakit;
      statistikKelas[kelas].detailKehadiran.izin += rekap.kehadiran.izin;
      statistikKelas[kelas].detailKehadiran.alpa += rekap.kehadiran.alpa;
    });

    // Hitung rata-rata per kelas
    Object.keys(statistikKelas).forEach((kelas) => {
      statistikKelas[kelas].rataRataKehadiran = (
        statistikKelas[kelas].rataRataKehadiran / statistikKelas[kelas].totalSiswa
      ).toFixed(2);
    });

    return NextResponse.json({
      success: true,
      data: {
        periode: {
          semester,
          tahunAjaran,
          totalHariEfektif
        },
        rekapKehadiran,
        statistikKelas
      }
    });
  } catch (error) {
    console.error('Error in attendance rekap route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}