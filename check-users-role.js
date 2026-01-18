const mongoose = require('mongoose');
const User = require('./src/models/User'); // Adjust path to your model

const MONGODB_URI = "mongodb://localhost:27017/noticeboard"; // Or from env

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const users = await mongoose.model('User').find({});
        console.log("Users found:", users.length);
        users.forEach(u => {
            console.log(`Username: ${u.username}, Role: ${u.role}, Status: ${u.permissionStatus}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
