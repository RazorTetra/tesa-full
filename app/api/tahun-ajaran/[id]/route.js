// app/api/tahun-ajaran/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/database";
import TahunAjaran from "../../../../backend/models/tahunAjaran";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const tahunAjaran = await TahunAjaran.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!tahunAjaran) {
      return NextResponse.json(
        { success: false, error: "Tahun ajaran tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tahunAjaran });
  } catch (error) {
    console.error('Error in tahun ajaran update route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}