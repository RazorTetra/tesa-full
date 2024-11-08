// app/api/tahun-ajaran/active/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/database";
import TahunAjaran from "../../../../backend/models/tahunAjaran";

export async function GET() {
  try {
    await connectDB();
    const activeTahunAjaran = await TahunAjaran.findOne({ isActive: true });
    
    if (!activeTahunAjaran) {
      return NextResponse.json(
        { success: false, error: "Tidak ada tahun ajaran yang aktif" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: activeTahunAjaran });
  } catch (error) {
    console.error('Error in active tahun ajaran route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}