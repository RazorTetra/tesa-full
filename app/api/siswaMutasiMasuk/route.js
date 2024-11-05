import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/database";
import SiswaMutasiMasuk from "../../../backend/models/siswaMutasiMasuk";

const connectToDatabase = async () => {
  if (!global.mongoose) {
    global.mongoose = connectDB();
  }
  await global.mongoose;
};

export async function GET(request) {
  await connectToDatabase();
  try {
    const mutasiMasuk = await SiswaMutasiMasuk.find();
    return NextResponse.json({ success: true, data: mutasiMasuk });
  } catch (error) {
    console.error("Error fetching siswa mutasi masuk:", error);
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
    const {
      nama,
      nisn,
      kelas,
      alamat,
      tanggalMasuk,
      nomorSurat,
      asalSekolah,
      alasan,
    } = body;

    if (
      !nama ||
      !nisn ||
      !kelas ||
      !alamat ||
      !tanggalMasuk ||
      !nomorSurat ||
      !asalSekolah ||
      !alasan
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newMutasiMasuk = new SiswaMutasiMasuk(body);
    await newMutasiMasuk.save();
    return NextResponse.json(
      { success: true, data: newMutasiMasuk },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding siswa mutasi masuk:", error);
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

    const deleteResult = await SiswaMutasiMasuk.findByIdAndDelete(id);
    if (!deleteResult) {
      return NextResponse.json(
        { success: false, error: "SiswaMutasiMasuk not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "SiswaMutasiMasuk deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting siswa mutasi masuk:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
