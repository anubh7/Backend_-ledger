require('dotenv').config();
const mongoose = require('mongoose');
const accountModel = require('./src/models/account.model');
const userModel = require('./src/models/user.model');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const account = await accountModel.findById('6adcad76b8cc0ec75fb7ae7c');
        if (!account) {
            console.log('✗ Account not found');
            return;
        }
        
        console.log('Account ID:', account._id.toString());
        console.log('Owner User ID:', account.user.toString());
        
        const user = await userModel.findById(account.user);
        if (user) {
            console.log('Owner Username:', user.username);
            console.log('Owner Email:', user.email);
            console.log('System User:', user.systemUser);
        } else {
            console.log('✗ Owner user not found!');
            
            // List all users to find the right one
            console.log('\n--- All Users ---');
            const allUsers = await userModel.find();
            allUsers.forEach(u => {
                console.log(`ID: ${u._id}, Username: ${u.username}, Email: ${u.email}, SystemUser: ${u.systemUser}`);
            });
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

check();