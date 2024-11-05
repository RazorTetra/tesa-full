// app/api/attendance/route.js
import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import Attendance from "@/backend/models/attendance";

export async function GET(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");
    const tahunAjaran = searchParams.get("tahunAjaran");
    
    let query = {};
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;

    const attendance = await Attendance.find(query).populate('siswaId');
    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    
    const newAttendance = new Attendance(body);
    await newAttendance.save();
    
    return NextResponse.json(
      { success: true, data: newAttendance },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// app/api/attendance/[id]/route.js
export async function PUT(request, { params }) {
  await connectDB();
  try {
    const body = await request.json();
    const attendance = await Attendance.findByIdAndUpdate(
      params.id,
      { $inc: body }, // Menggunakan $inc untuk menambah nilai
      { new: true, runValidators: true }
    );
    
    if (!attendance) {
      return NextResponse.json(
        { success: false, error: "Attendance not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}