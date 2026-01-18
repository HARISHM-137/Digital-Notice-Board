import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const { id } = await params; // Await params in newer Next.js or just access if type allows. Next 15+ needs await.
        // Actually params is a Promise in recent versions but standard type is { params: ... }

        if (!id) {
            return new NextResponse('Missing ID', { status: 400 });
        }

        const db = mongoose.connection.db;
        if (!db) {
            return new NextResponse('Database error', { status: 500 });
        }
        const bucket = new mongoose.mongo.GridFSBucket(db);

        const _id = new ObjectId(id);

        const files = await bucket.find({ _id }).toArray();
        if (files.length === 0) {
            return new NextResponse('File not found', { status: 404 });
        }
        const file = files[0] as any;

        const stream = bucket.openDownloadStream(_id);

        // Return stream as response
        // Next.js Response supports ReadableStream
        // We need to convert Node stream to Web Stream or use `new Response(stream as any)`

        // Efficient streaming:
        // This is a minimal implementation.

        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': file.contentType || 'application/octet-stream',
                'Content-Length': file.length.toString(),
            },
        });
    } catch (error: any) {
        console.error(error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
