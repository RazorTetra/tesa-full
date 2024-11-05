import { NextResponse } from "next/server";
import connectDB from "@/backend/config/database";
import Guru from "@/backend/models/guru";

export async function GET(request, { params }) {
  await connectDB();
  try {
    const guru = await Guru.findById(params.id);
    if (!guru) {
      return NextResponse.json(
        { success: false, error: "Guru tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: guru });
  } catch (error) {
    console.error("Error fetching guru:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  await connectDB();
  try {
    const body = await request.json();
    const guru = await Guru.findByIdAndUpdate(params.id, body, { new: true });
    if (!guru) {
      return NextResponse.json(
        { success: false, error: "Guru tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: guru });
  } catch (error) {
    console.error("Error updating guru:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  await connectDB();
  try {
    const guru = await Guru.findByIdAndDelete(params.id);
    if (!guru) {
      return NextResponse.json(
        { success: false, error: "Guru tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      message: "Guru berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting guru:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
