import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import Guru from "../../../backend/models/guru";

const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    const guru = await Guru.find();
    return NextResponse.json({ success: true, data: guru });
  } catch (error) {
    console.error("Error fetching guru:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    if (
      !body.nama ||
      !body.nip ||
      !body.nomorTlp ||
      !body.agama ||
      !body.alamat
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newGuru = new Guru(body);
    await newGuru.save();
    return NextResponse.json({ success: true, data: newGuru }, { status: 201 });
  } catch (error) {
    console.error("Error adding guru:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
