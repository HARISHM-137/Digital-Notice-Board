import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notice from '@/models/Notice';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'hod', 'principal'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const formData = await req.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const files = formData.getAll('files') as File[];

        const media = [];
        if (files && files.length > 0) {
            const db = mongoose.connection.db;
            if (!db) throw new Error('Database not connected');
            const bucket = new mongoose.mongo.GridFSBucket(db);

            for (const file of files) {
                if (file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const uploadStream = bucket.openUploadStream(file.name, {
                        contentType: file.type,
                    });
                    await new Promise((resolve, reject) => {
                        uploadStream.end(buffer, (err: any) => {
                            if (err) reject(err);
                            else resolve(null);
                        });
                    });
                    media.push({
                        fileId: uploadStream.id.toString(),
                        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
                        filename: file.name,
                        contentType: file.type,
                    });
                }
            }
        }

        const notice = await Notice.create({
            title,
            content,
            media,
            createdBy: session.user.id,
        });

        return NextResponse.json(notice);
    } catch (error: any) {
        console.error('Error creating notice:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        // Public access allows fetching notices
        const notices = await Notice.find().sort({ createdAt: -1 }).populate('createdBy', 'username role'); // Populate creator
        return NextResponse.json(notices);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'hod', 'principal'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await dbConnect();
        const notice = await Notice.findById(id);

        if (!notice) {
            return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
        }

        // Delete associated media files from GridFS
        if (notice.media && notice.media.length > 0) {
            const db = mongoose.connection.db;
            if (db) {
                const bucket = new mongoose.mongo.GridFSBucket(db);
                for (const file of notice.media) {
                    try {
                        const fileId = new mongoose.Types.ObjectId(file.fileId);
                        await bucket.delete(fileId);
                    } catch (err) {
                        console.error(`Failed to delete file ${file.fileId}:`, err);
                    }
                }
            }
        }

        await Notice.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Notice deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting notice:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'hod', 'principal'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await dbConnect();

        // Handle FormData for file upgrades + text updates
        const formData = await req.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const files = formData.getAll('files') as File[];

        const updateData: any = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        updateData.updatedBy = session.user.id;

        const notice = await Notice.findById(id);
        if (!notice) {
            return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
        }

        // Initialize media array if it doesn't exist
        if (!notice.media) notice.media = [];

        // Append new files if any
        if (files && files.length > 0) {
            const db = mongoose.connection.db;
            if (!db) throw new Error('Database not connected');
            const bucket = new mongoose.mongo.GridFSBucket(db);

            for (const file of files) {
                if (file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const uploadStream = bucket.openUploadStream(file.name, {
                        contentType: file.type,
                    });
                    await new Promise((resolve, reject) => {
                        uploadStream.end(buffer, (err: any) => {
                            if (err) reject(err);
                            else resolve(null);
                        });
                    });

                    // Add new media to the array
                    notice.media.push({
                        fileId: uploadStream.id.toString(),
                        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
                        filename: file.name,
                        contentType: file.type,
                    });
                }
            }
            updateData.media = notice.media;
        }

        const updatedNotice = await Notice.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        return NextResponse.json(updatedNotice);
    } catch (error: any) {
        console.error('Error updating notice:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
