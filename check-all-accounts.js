require('dotenv').config();
const mongoose = require('mongoose');
const accountModel = require('./src/models/account.model');
const userModel = require('./src/models/user.model');
const ledgerModel = require('./src/models/ledger.model');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('=== All Accounts ===');
        const accounts = await accountModel.find();
        for (const acc of accounts) {
            const user = await userModel.findById(acc.user);
            const balance = await acc.getBalance();
            console.log(`Account: ${acc._id}`);
            console.log(`  User ID: ${acc.user}`);
            console.log(`  User: ${user ? user.username + ' (' + user.email + ')' : 'NOT FOUND (orphaned)'}`);
            console.log(`  Balance: ${balance}`);
            console.log(`  Status: ${acc.status}, Currency: ${acc.currency}`);
            console.log('---');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

check();