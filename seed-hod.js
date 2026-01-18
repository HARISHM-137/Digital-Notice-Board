const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/noticeboard';

async function seedHOD() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const username = 'hod_sample';
        const password = 'hod123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await mongoose.connection.db.collection('users').findOne({ username });
        if (existingUser) {
            console.log('User already exists');
        } else {
            await mongoose.connection.db.collection('users').insertOne({
                username,
                password: hashedPassword,
                role: 'hod',
                permissionStatus: 'approved', // Pre-approve so they can login immediately
                createdAt: new Date(),
                __v: 0
            });
            console.log(`HOD User created: ${username} / ${password}`);
        }

        // List all users to confirm
        const allUsers = await mongoose.connection.db.collection('users').find().toArray();
        console.log('\nAll Users in DB:');
        allUsers.forEach(u => console.log(`- ${u.username} (${u.role}) [${u.permissionStatus}]`));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

seedHOD();
