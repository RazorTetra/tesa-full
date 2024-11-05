import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import Siswa from "../../../backend/models/siswa";

const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    const siswa = await Siswa.find();
    return NextResponse.json({ success: true, data: siswa });
  } catch (error) {
    console.error("Error fetching siswa:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const requiredFields = ['nama', 'nisn', 'kelas', 'alamat', 'status'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const newSiswa = new Siswa(body);
    await newSiswa.save();
    return NextResponse.json(
      { success: true, data: newSiswa },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding siswa:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add student" },
      { status: 500 }
    );
  }
}