const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/noticeboard';

async function approveHOD() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const username = 'hod';
        const password = '123456';

        const existingUser = await mongoose.connection.db.collection('users').findOne({ username });

        if (existingUser) {
            console.log(`Found user '${username}'. Updating status to approved...`);
            // If password needs updating to match user request (optional, but good for sync)
            // For now, valid assumption is they just want approval. But if they provided a password, maybe they want it set?
            // I'll update the password too just in case it's a creation request or password reset.
            const hashedPassword = await bcrypt.hash(password, 10);

            await mongoose.connection.db.collection('users').updateOne(
                { username },
                {
                    $set: {
                        permissionStatus: 'approved',
                        role: 'hod', // Ensure they are HOD as implied by username
                        password: hashedPassword
                    }
                }
            );
            console.log(`User '${username}' approved and password updated.`);
        } else {
            console.log(`User '${username}' not found. Creating new approved HOD user...`);
            const hashedPassword = await bcrypt.hash(password, 10);
            await mongoose.connection.db.collection('users').insertOne({
                username,
                password: hashedPassword,
                role: 'hod',
                permissionStatus: 'approved',
                createdAt: new Date(),
                __v: 0
            });
            console.log(`User '${username}' created and approved.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

approveHOD();
