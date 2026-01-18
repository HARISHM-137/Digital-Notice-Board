const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/noticeboard';

async function checkDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const users = await mongoose.connection.db.collection('users').find().toArray();
        console.log('Users found:', users.length);
        console.log(JSON.stringify(users, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDB();
