import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import Absen from "../../../backend/models/absen";

const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const absensi = await Absen.find({
      timestamp: { $gte: today, $lt: tomorrow },
    }).sort({ timestamp: -1 });

    return NextResponse.json({ success: true, data: absensi });
  } catch (error) {
    console.error("Error fetching absensi:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const requiredFields = ['nama', 'tanggal', 'kelas', 'keterangan', 'mataPelajaran'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const newAbsen = new Absen(body);
    await newAbsen.save();
    return NextResponse.json({ success: true, data: newAbsen }, { status: 201 });
  } catch (error) {
    console.error("Error adding absen:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add attendance record" },
      { status: 500 }
    );
  }
}