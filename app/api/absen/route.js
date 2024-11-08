// app/api/absen/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import Absen from "../../../backend/models/absen";

export async function GET(request) {
  try {
    await connectDB();
    
    // Check if we want today's data only
    const { searchParams } = new URL(request.url);
    const today = searchParams.get("today");

    let query = {};
    if (today === "true") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      query.tanggal = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const absensi = await Absen.find(query).sort({ tanggal: -1 });
    
    return NextResponse.json({ success: true, data: absensi });
  } catch (error) {
    console.error('Error in absen route:', error);
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
    
    // Normalize tanggal
    const formattedDate = new Date(body.tanggal);
    formattedDate.setHours(0, 0, 0, 0);
    body.tanggal = formattedDate;

    // Normalize mataPelajaran
    body.mataPelajaran = body.mataPelajaran.trim().toUpperCase();

    const absen = await Absen.create(body);
    
    return NextResponse.json({ success: true, data: absen });
  } catch (error) {
    console.error('Error in absen route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}