// app/api/tahun-ajaran/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import TahunAjaran from "@/backend/models/tahunAjaran";

export async function GET() {
  try {
    await connectDB();
    const tahunAjaran = await TahunAjaran.find()
      .sort("-tanggalMulai")
      .select("-__v");

    return NextResponse.json({ success: true, data: tahunAjaran });
  } catch (error) {
    console.error("Error in tahun ajaran route:", error);
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

    // Validasi format tahun ajaran
    if (!/^\d{4}\/\d{4}$/.test(body.tahunAjaran)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format tahun ajaran tidak valid. Gunakan format: 2023/2024",
        },
        { status: 400 }
      );
    }

    // Validasi tanggal
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

    // Validasi total hari efektif
    if (!body.totalHariEfektif || body.totalHariEfektif < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Total hari efektif harus diisi dan minimal 1",
        },
        { status: 400 }
      );
    }

    const tahunAjaran = await TahunAjaran.create({
      ...body,
      tanggalMulai,
      tanggalSelesai,
    });

    return NextResponse.json({ success: true, data: tahunAjaran });
  } catch (error) {
    console.error("Error in tahun ajaran route:", error);

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
