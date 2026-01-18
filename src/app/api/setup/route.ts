import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    await dbConnect();

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
        return NextResponse.json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        permissionStatus: 'approved',
    });

    return NextResponse.json({ message: 'Admin created', user: admin });
}
