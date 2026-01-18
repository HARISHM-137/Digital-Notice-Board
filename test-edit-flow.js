const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/noticeboard';

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
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Notice = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);

async function testEditFlow() {
    console.log('--- Starting Notice Edit Test ---');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('1. DB Connected');

        // 1. Create Notice
        console.log('2. Creating initial Notice...');
        const notice = await Notice.create({
            title: 'Original Title',
            content: 'Original Content',
            media: [],
        });
        console.log(`   Notice created with ID: ${notice._id}`);
        console.log(`   Initial Title: ${notice.title}`);

        // 2. Simulate Edit (Update)
        // In the real app, this is done via PUT request which calls findByIdAndUpdate
        console.log('3. Updating Notice (Simulating PUT)...');

        const updatedTitle = 'Edited Vibrant Title';
        const updatedContent = 'Edited Content with more details.';

        const updatedNotice = await Notice.findByIdAndUpdate(
            notice._id,
            {
                $set: {
                    title: updatedTitle,
                    content: updatedContent,
                    updatedBy: new mongoose.Types.ObjectId() // Simulate user ID
                }
            },
            { new: true }
        );

        console.log(`   Notice updated.`);

        // 3. Verify Update
        console.log('4. Verifying Update...');
        if (updatedNotice.title !== updatedTitle) throw new Error('Title mismatch!');
        if (updatedNotice.content !== updatedContent) throw new Error('Content mismatch!');

        console.log(`   New Title: ${updatedNotice.title}`);
        console.log(`   New Content: ${updatedNotice.content}`);

        // 4. Cleanup
        console.log('5. Cleaning up...');
        await Notice.findByIdAndDelete(notice._id);
        console.log('   Test notice deleted.');

        console.log('--- Test Passed! Edit flow works. ---');
    } catch (err) {
        console.error('--- Test FAILED ---');
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

testEditFlow();
