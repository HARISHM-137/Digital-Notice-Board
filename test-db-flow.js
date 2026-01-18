const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MONGODB_URI should be in .env.local, but for this script we might need to hardcode or read it.
// Assuming localhost for locally running mongo as seen in check-db.js
const MONGODB_URI = 'mongodb://localhost:27017/noticeboard';

// Models (Simplified for the script if imports fail, or use require if transpile setup allows)
// Since this is a plain JS script running with 'node', we can't easily import TS files directly without ts-node.
// So I will define minimal schemas here to match src/models/Notice.ts for testing purposes.

const NoticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    media: [
        {
            fileId: { type: String, required: true },
            type: { type: String, enum: ['image', 'video', 'audio'], required: true },
            filename: { type: String, required: true },
            contentType: { type: String },
        },
    ],
    // Simplified refs for testing
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Notice = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);

async function testFlow() {
    console.log('--- Starting MongoDB Flow Test ---');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('1. DB Connected');

        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db);

        // 2. Create a dummy file stream
        const testContent = Buffer.from('Hello GridFS World');
        const filename = 'test-file-' + Date.now() + '.txt';

        console.log(`2. Uploading file: ${filename}`);
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: 'text/plain'
        });

        const fileId = await new Promise((resolve, reject) => {
            uploadStream.end(testContent, (err) => {
                if (err) reject(err);
                else resolve(uploadStream.id);
            });
        });
        console.log(`   File uploaded with ID: ${fileId}`);

        // 3. Create Notice
        console.log('3. Creating Notice...');
        const notice = await Notice.create({
            title: 'Test Generic Notice',
            content: 'This is a test notice to verify persistence.',
            media: [{
                fileId: fileId.toString(),
                type: 'image', // faking type for schema validation
                filename: filename,
                contentType: 'text/plain'
            }],
            createdBy: new mongoose.Types.ObjectId() // fake user ID
        });
        console.log(`   Notice created with ID: ${notice._id}`);

        // 4. Retrieve Notice
        console.log('4. Retrieving Notice...');
        const foundNotice = await Notice.findById(notice._id);
        if (!foundNotice) throw new Error('Notice not found!');
        console.log(`   Notice found: ${foundNotice.title}`);

        // 5. Verify File Exists in GridFS
        console.log('5. Verifying GridFS file...');
        const fileDocs = await bucket.find({ _id: fileId }).toArray();
        if (fileDocs.length === 0) throw new Error('GridFS file not found!');
        console.log('   GridFS file exists.');

        // 6. Delete Notice and File (Replicating logic from API)
        console.log('6. Deleting Notice and File...');

        // Delete files
        for (const m of foundNotice.media) {
            const fId = new mongoose.Types.ObjectId(m.fileId);
            await bucket.delete(fId);
            console.log(`   Deleted GridFS file: ${m.fileId}`);
        }

        // Delete document
        await Notice.findByIdAndDelete(foundNotice._id);
        console.log('   Deleted Notice document.');

        // 7. Verify Deletion
        const checkNotice = await Notice.findById(notice._id);
        if (checkNotice) throw new Error('Notice still exists!');

        const checkFile = await bucket.find({ _id: fileId }).toArray();
        if (checkFile.length > 0) throw new Error('GridFS file still exists!');

        // 8. Test User Creation (Signup simulator)
        console.log('8. Testing User Creation (Signup)...');
        // Define User Model for script (if not already effectively available, we can use mongoose.models.User if initialized, or define temp)
        const UserSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, default: 'student' },
            permissionStatus: { type: String, default: 'none' },
        });
        // Avoid overwriting if exists
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const testUser = 'testuser_' + Date.now();
        await User.create({
            username: testUser,
            password: 'hashedpassword123',
            role: 'student',
            permissionStatus: 'approved'
        });

        const createdUser = await User.findOne({ username: testUser });
        if (!createdUser) throw new Error('User creation failed');
        console.log(`   User created: ${createdUser.username}`);

        // Cleanup User
        await User.deleteOne({ username: testUser });
        console.log('   Test user deleted.');

        console.log('--- Test Passed! All operations successful. ---');
    } catch (err) {
        console.error('--- Test FAILED ---');
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

testFlow();
