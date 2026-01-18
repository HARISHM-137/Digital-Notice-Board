import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { username, password, role } = await req.json();

        if (!username || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Students are auto-approved (though they don't really login in this system based on original req, 
        // but if we support student login later, this handles it. 
        // For Admin/HOD, status is pending.
        const permissionStatus = role === 'student' ? 'approved' : 'pending';

        const user = await User.create({
            username,
            password: hashedPassword,
            role,
            permissionStatus,
        });

        return NextResponse.json({ message: 'User created successfully', user: { username: user.username, role: user.role, status: user.permissionStatus } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
