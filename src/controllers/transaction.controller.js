const { transactionModel } = require('../models/transaction.model');
const mongoose = require('mongoose');
const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service');
const accountModel = require('../models/account.model');

/**
 * create a new transaction
 * the 10 step transfer flow
 * 1. validate request
 * 2. validate idempotency key
 * 3. check account status
 * 4. derive sender balance from ledger
 * 5. create transaction record(pending)
 * 6. create ledger entry for sender (debit)
 * 7. create ledger entry for receiver (credit)
 * 8  Mark  transcation as completed
 * 9. commit mongodb session
 * 10. send email notification to sender and receiver
 */

async function createTransaction(req, res) {
    
    /* Step 1: Validate request */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Missing required fields' });
    }   

    const fromuseraccount = await accountModel.findOne({ _id: fromAccount,
    })
    const touseraccount = await accountModel.findOne({ _id: toAccount,
    })

    if(!fromuseraccount || !touseraccount) {
        return res.status(400).json({ message: 'Invalid account IDs' });
    }

    /* Step 2: Validate idempotency key */
    const existingTransaction = await transactionModel.findOne({ idempotencyKey: idempotencyKey });
    if (existingTransaction) {
        if (existingTransaction.status === 'completed') {
            return res.status(200).json({ message: 'Transaction already completed', transaction: existingTransaction });
        }
        if (existingTransaction.status === 'pending') {
            return res.status(200).json({ message: 'Transaction is already pending', transaction: existingTransaction });
        }
        if (existingTransaction.status === 'failed') {
            return res.status(200).json({ message: 'Transaction has failed', transaction: existingTransaction });
        }
        if (existingTransaction.status === 'reversed') {
            return res.status(200).json({ message: 'Transaction has been reversed please try again', transaction: existingTransaction });
        }
    }

    /* Step 3: Check account status */
    if (fromuseraccount.status !== 'active' || touseraccount.status !== 'active') {
        return res.status(400).json({ message: 'One or both accounts are not active' });
    }

    /* Step 4: Derive sender balance from ledger */

    const balance = await fromuseraccount.getBalance();
    if (balance < amount) {
        return res.status(400).json({ message: `Insufficient funds. current balance is ${balance}. Requested amount is ${amount}` });
    }
    
    let newTransaction;
    try{

    /* Start MongoDB session for transaction */
    const session = await mongoose.startSession();
    session.startTransaction();

    /* Step 5: Create transaction record (pending) */
    [newTransaction] = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: 'pending'
    }], { session });

    /* Step 6: Create ledger entry for sender (debit) */
    const debitledgerEntry= await ledgerModel.create([{
        account: fromAccount,
        type: 'debit',
        amount: amount,
        transaction: newTransaction._id
    }], { session });

    await (()=>{
        return new Promise((resolve)=>{
            setTimeout(()=>{resolve();}, 10*1000);
        });
    })()

    /* Step 7: Create ledger entry for receiver (credit) */
    const creditledgerEntry= await ledgerModel.create([{
        account: toAccount,
        type: 'credit',
        amount: amount,
        transaction: newTransaction._id
    }], { session });

    /* Step 8: Mark transaction as completed */
    await transactiionModel.findOneAndUpdate({ _id: newTransaction._id }, { status: 'completed' }, { session });

    /* Step 9: Commit MongoDB session */
    await session.commitTransaction();
    session.endSession();
}catch(err){
    await transactionModel.findOneAndUpdate({ idempotencyKey: idempotencyKey }, { status: 'failed' });
    console.error('Transaction failed:', err);
    return res.status(500).json({ message: 'Transaction is pending please try again later', error: err.message });
}

    /* Step 10: Send email notification to sender and receiver */
    await emailService.sendTransactionEmail(req.user.email, req.user.username, amount, newTransaction._id);

    return res.status(201).json({ message: 'Transaction completed successfully', transaction: newTransaction });
    

}

async function createinitialFundsTransaction(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body;
    
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Missing required fields toaccount, amount, and idempotencyKey are required' });
    }

    const  touseraccount = await accountModel.findOne({ _id: toAccount });

    if(!touseraccount) {
        return res.status(400).json({ message: 'Invalid account ID' });
    }

    const fromUseraccount = await accountModel.findOne({user: req.user._id });

    if(!fromUseraccount) {
        return res.status(400).json({ message: 'System account not found' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const [Transaction] = await transactionModel.create([{
        fromAccount: fromUseraccount._id,
        toAccount: toAccount,
        amount: amount,
        idempotencyKey: idempotencyKey,
        status: 'pending'
    }], { session });

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUseraccount._id,
        type: 'debit',
        amount: amount,
        transaction: Transaction._id
    }], { session });

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        type: 'credit',
        amount: amount,
        transaction: Transaction._id
    }], { session });

    Transaction.status = 'completed';
    await Transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: 'Initial funds transaction completed successfully', transaction: Transaction });
}

    

module.exports={
    createTransaction,
    createinitialFundsTransaction
};