require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userModel = require('./src/models/user.model');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 10000
        });

        const user = await userModel.findOne({ email: 'dadagupta7@gmail.com' }).select('+password');
        if (!user) {
            console.log('✗ User not found');
            return;
        }

        const isMatch = await bcrypt.compare('NewPass123!', user.password);
        console.log(`User: ${user.username}`);
        console.log(`Password matches: ${isMatch}`);
        
        if (!isMatch) {
            console.log('⚠️  Password does NOT match! The reset may not have saved.');
        } else {
            console.log('✓ Password is correct!');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verify();