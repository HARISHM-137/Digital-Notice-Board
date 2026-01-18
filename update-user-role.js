const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/noticeboard";

const userSchema = new mongoose.Schema({
    username: String,
    role: String,
    permissionStatus: String
});

const User = mongoose.model('User', userSchema);

async function updateUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const result = await User.updateOne(
            { username: "12" },
            { $set: { role: "admin", permissionStatus: "approved" } }
        );

        console.log("Update result:", result);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

updateUser();
