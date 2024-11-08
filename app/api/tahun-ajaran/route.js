// app/api/tahun-ajaran/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import TahunAjaran from "../../../backend/models/tahunAjaran";

export async function GET() {
  try {
    await connectDB();
    const tahunAjaran = await TahunAjaran.find().sort('-tanggalMulai');
    
    return NextResponse.json({ success: true, data: tahunAjaran });
  } catch (error) {
    console.error('Error in tahun ajaran route:', error);
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
    
    const tahunAjaran = await TahunAjaran.create(body);
    
    return NextResponse.json({ success: true, data: tahunAjaran });
  } catch (error) {
    console.error('Error in tahun ajaran route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}