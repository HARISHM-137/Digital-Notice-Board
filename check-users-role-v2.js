const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/noticeboard";

const userSchema = new mongoose.Schema({
    username: String,
    role: String,
    permissionStatus: String
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const users = await User.find({});
        console.log("Users found:", users.length);
        users.forEach(u => {
            console.log(`Username: ${u.username}, Role: ${u.role}, Permission: ${u.permissionStatus}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
