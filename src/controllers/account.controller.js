const accountModel = require('../models/account.model');



async function createAccount(req,res){
    try{
        const user=req.user;

        if(!user){
            return res.status(401).json({ message: 'Unauthorized: No user found' });
        }

        const account=await accountModel.create({
            user: user._id
            // status defaults to 'active', currency defaults to 'INR' via schema
        })

        return res.status(201).json({ message: 'Account created successfully', account });

    }catch(err){
        console.error(err);
        if(err.name === 'ValidationError'){
            return res.status(400).json({ message: Object.values(err.errors)[0].message });
        }
        if(err.code === 11000){
            return res.status(400).json({ message: 'Account already exists for this user' });
        }
        return res.status(500).json({ message: 'Server error', error: err.message });
    }

}

async function getUserAccounts(req,res){

    const accounts=await accountModel.find({user:req.user._id});
    return res.status(200).json({ accounts });
}

async function getAccountBalance(req,res){
    const { accountId } = req.params;

    const account = await accountModel.findOne({ _id: accountId, user: req.user._id });

    if (!account) {
        return res.status(404).json({ message: 'Account not found' });
    }
    const balance = await account.getBalance(); // Call the instance method to get the balance
    return res.status(200).json({ accountId: account._id, balance });
}

module.exports = { createAccount, getUserAccounts, getAccountBalance };
