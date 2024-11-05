import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import SiswaMutasiKeluar from "../../../backend/models/siswaMutasiKeluar";

const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    const mutasiKeluar = await SiswaMutasiKeluar.find();
    return NextResponse.json({ success: true, data: mutasiKeluar });
  } catch (error) {
    console.error("Error fetching siswa mutasi keluar:", error);
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
      !body.nisn ||
      !body.kelas ||
      !body.alamat ||
      !body.tanggalKeluar ||
      !body.nomorSurat ||
      !body.tujuanSekolah ||
      !body.alasan
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newMutasiKeluar = new SiswaMutasiKeluar(body);
    await newMutasiKeluar.save();
    return NextResponse.json(
      { success: true, data: newMutasiKeluar },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding siswa mutasi keluar:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  await connectToDatabase();
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required id field" },
        { status: 400 },
      );
    }

    const deleteResult = await SiswaMutasiKeluar.findByIdAndDelete(id);
    if (!deleteResult) {
      return NextResponse.json(
        { success: false, error: "SiswaMutasiKeluar not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "SiswaMutasiMasuk deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting siswa mutasi keluar:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
