import mongoose from 'mongoose';

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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
