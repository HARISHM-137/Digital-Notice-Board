import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params; // ✅ DO NOT await params

    if (!id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return new NextResponse("Database error", { status: 500 });
    }

    const bucket = new mongoose.mongo.GridFSBucket(db);
    const _id = new ObjectId(id);

    const files = await bucket.find({ _id }).toArray();
    if (files.length === 0) {
      return new NextResponse("File not found", { status: 404 });
    }

    const file = files[0] as any;
    const stream = bucket.openDownloadStream(_id);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Length": file.length.toString()
      }
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
