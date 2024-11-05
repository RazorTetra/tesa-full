import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/database";
import Siswa from "../../../../backend/models/siswa";

const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request, { params }) {
  await connectToDatabase();
  try {
    const siswa = await Siswa.findById(params.id);
    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: siswa });
  } catch (error) {
    console.error("Error fetching siswa:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const updatedSiswa = await Siswa.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!updatedSiswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updatedSiswa });
  } catch (error) {
    console.error("Error updating siswa:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  await connectToDatabase();
  try {
    const deletedSiswa = await Siswa.findByIdAndDelete(params.id);
    if (!deletedSiswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Student successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting siswa:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete student" },
      { status: 500 }
    );
  }
}