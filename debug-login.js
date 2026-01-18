const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/noticeboard';

async function testLogin(username, password) {
    try {
        const user = await mongoose.connection.db.collection('users').findOne({ username });
        if (!user) {
            console.log(`[FAIL] User '${username}' not found.`);
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log(`[FAIL] Password for '${username}' is incorrect.`);
            return;
        }

        console.log(`[PASS] Password for '${username}' is CORRECT.`);

        if (['admin', 'hod', 'principal'].includes(user.role)) {
            if (user.permissionStatus !== 'approved') {
                console.log(`[FAIL] Permission status is '${user.permissionStatus}' (Expected: 'approved')`);
            } else {
                console.log(`[PASS] Permission status is 'approved'. Login should succeed.`);
            }
        }

    } catch (err) {
        console.error(`[ERROR] `, err);
    }
}

async function runTests() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB. Running tests...\n');

        await testLogin('admin', 'admin123');
        await testLogin('hod', '123456');

    } finally {
        await mongoose.disconnect();
    }
}

runTests();
