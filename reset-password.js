require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');

const targetEmail = 'dadagupta7@gmail.com';
const newPassword = 'NewPass123!'; // ⚠️ CHANGE THIS to your desired password

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 10000
        });
        console.log('✓ Connected to MongoDB');

        const user = await userModel.findOne({ email: targetEmail }).select('+password');
        if (!user) {
            console.log('✗ No user found with email:', targetEmail);
            process.exit(1);
        }

        console.log(`✓ Found user: ${user.username} (${user.email})`);

        // Set plain text password — the pre-save hook in user.model.js will hash it automatically
        user.password = newPassword;
        await user.save();

        console.log(`✓ Password reset successfully!`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  New password: ${newPassword}`);
        console.log(`  ⚠️  Please change this after logging in!`);
    } catch (err) {
        console.error('✗ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetPassword();