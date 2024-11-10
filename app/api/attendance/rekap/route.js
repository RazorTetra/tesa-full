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

    // Dapatkan data tahun ajaran
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

    // Base query untuk siswa
    let siswaQuery = {};
    if (kelas) {
      siswaQuery.kelas = kelas;
    }

    // Dapatkan semua siswa
    const siswaList = await Siswa.find(siswaQuery);
    
    // Dapatkan total hari efektif per kelas berdasarkan jadwal mata pelajaran
    const hariEfektifPerKelas = {};
    for (const siswa of siswaList) {
      if (!hariEfektifPerKelas[siswa.kelas]) {
        // Hitung berdasarkan unique dates dari absensi
        const uniqueDays = await Absen.distinct('tanggal', {
          kelas: siswa.kelas,
          semester: parseInt(semester),
          tahunAjaran
        });
        
        hariEfektifPerKelas[siswa.kelas] = uniqueDays.length || tahunAjaranData.totalHariEfektif || 0;
      }
    }

    // Dapatkan rekap kehadiran untuk semua siswa
    const rekapKehadiran = await Promise.all(
      siswaList.map(async (siswa) => {
        const absensiDetail = await Absen.find({
          siswaId: siswa._id,
          semester: parseInt(semester),
          tahunAjaran
        });

        const totalHariEfektif = hariEfektifPerKelas[siswa.kelas];
        const totalHadir = absensiDetail.filter(a => a.keterangan === 'HADIR').length;
        const totalSakit = absensiDetail.filter(a => a.keterangan === 'SAKIT').length;
        const totalIzin = absensiDetail.filter(a => a.keterangan === 'IZIN').length;
        const totalAlpa = absensiDetail.filter(a => a.keterangan === 'ALPA').length;
        
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
            totalHariEfektif,
            persentaseKehadiran
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
          },
          riwayatAbsensi: absensiDetail.map(absen => ({
            tanggal: absen.tanggal,
            keterangan: absen.keterangan,
            mataPelajaran: absen.mataPelajaran
          }))
        };
      })
    );

    // Hitung statistik per kelas dengan data yang lebih akurat
    const statistikKelas = {};
    rekapKehadiran.forEach((rekap) => {
      const kelas = rekap.siswa.kelas;
      if (!statistikKelas[kelas]) {
        statistikKelas[kelas] = {
          totalSiswa: 0,
          rataRataKehadiran: 0,
          totalHariEfektif: hariEfektifPerKelas[kelas],
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
          tahunAjaran
        },
        rekapKehadiran: rekapKehadiran,
        statistikKelas: statistikKelas
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