const mongoose = require('mongoose');
const ledgerModel = require('./ledger.model');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // it is used to create a reference to the User model. it is used to create a relationship between the Account and User models. it is used to store the user id in the account model. it is used to fetch the user details from the user model. it is used to create a one-to-one relationship between the Account and User models.
        ref: 'User',
        required: [true, 'Account must be associated with a user'],
        unique: true,
        index: true // it is used to create an index on the user field. it is used to improve the performance of the queries that filter by user. it is used to ensure that each user can have only one account.
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'closed'],
        default: 'active'
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'INR'],
        default: 'INR'
    },
}, { timestamps: true });

accountSchema.index({ user: 1, status: 1 }); // it is used to create a compound index on the user and status fields.

accountSchema.methods.getBalance = async function () {
    const balanceData= await ledgerModel.aggregate([
        { $match: { account: this._id } },
        { $group: {
            _id: null,
            totalCredit: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
            totalDebit: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } }
        }},
        { $project: {
            balance: { $subtract: ['$totalCredit', '$totalDebit'] }
        }}
    ]);

    return balanceData.length > 0 ? balanceData[0].balance : 0;
};


const accountModel = mongoose.model('Account', accountSchema);

module.exports = accountModel;