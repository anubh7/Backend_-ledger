require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');
const accountModel = require('./src/models/account.model');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Create a new user for the orphaned account
        const newUser = await userModel.create({
            username: 'orphaned_owner',
            email: 'orphaned@bank.com',
            password: 'OrphanPass123!'
        });

        console.log('✓ Created new user:', newUser.username, '(', newUser.email, ')');
        console.log('  User ID:', newUser._id);
        console.log('  Password: OrphanPass123!');

        // Link the orphaned account to this new user
        const updatedAccount = await accountModel.findByIdAndUpdate(
            '6adcad76b8cc0ec75fb7ae7c',
            { user: newUser._id },
            { new: true }
        );

        console.log('✓ Linked account 6adcad76b8cc0ec75fb7ae7c to user:', newUser.username);
        console.log('  Account balance: 1000');

    } catch (err) {
        console.error('✗ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fix();