import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    role: {
        type: String,
        enum: ['student', 'admin', 'hod', 'principal'],
        default: 'student',
    },
    permissionStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'none'],
        default: 'none',
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
