const mongoose=require('mongoose');
const {transactionSchema}=require('./transaction.model');


const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Account',
        required:[true,'Account is required'],
        index:true,
        immutable:true //means once the account is set, it cannot be changed. This is important for maintaining the integrity of the ledger, as each transaction should be associated with a specific account and should not be able to be reassigned to a different account after creation.
    },
    amount:{
        type:Number,
        required:[true,'Amount is required'],
        immutable:true, //means once the amount is set, it cannot be changed. This is important for maintaining the integrity of the ledger, as each transaction should have a specific amount that cannot be altered after creation.
        index:true
    },
    type:{
        type:String,
        enum:{
            values:['credit','debit'],
            message:'Type must be either credit or debit'
        },
        required:[true,'Type is required'],
        immutable:true //means once the type is set, it cannot be changed. This is important for maintaining the integrity of the ledger, as each transaction should have a specific type that cannot be altered after creation.
    },
},{timestamps:true});

//below function is used to prevent any modifications or deletions of ledger entries, ensuring that once a ledger entry is created, it remains unchanged for integrity and audit purposes.

async function preventledgerModification() {
    // `this.isNew` is true for new documents being created, false for existing documents being updated
    // We only want to block modifications to EXISTING ledger entries, not creation of new ones
    // For query middleware (updateOne, deleteOne, etc.), `this.isNew` is undefined, so we block those too
    if (!this.isNew) {
        throw new Error('Ledger entries are immutable and cannot be modified or deleted.');
    }
    // Allow creation of new ledger entries (this.isNew === true)
}
//means ham ledgerSchema ke liye pre hooks ka use karke preventledgerModification function ko call kar rhe hai taki ledger entries ko modify ya delete na kiya ja sake. isse hme security milegi taki hme pata chale ki ledger entries ko modify ya delete nahi kiya ja sakta.
//pre hooks-- thses are middleware functions that are executed before certain operations (like save, update, delete) on the schema. In this case, we are using pre hooks to prevent any modifications or deletions of ledger entries, ensuring that once a ledger entry is created, it remains unchanged for integrity and audit purposes.
ledgerSchema.pre('save', preventledgerModification);
ledgerSchema.pre('updateOne', preventledgerModification);
ledgerSchema.pre('deleteOne', preventledgerModification);
ledgerSchema.pre('findOneAndUpdate', preventledgerModification);
ledgerSchema.pre('findOneAndDelete', preventledgerModification);
ledgerSchema.pre('remove', preventledgerModification);
ledgerSchema.pre('deleteMany', preventledgerModification);
ledgerSchema.pre('updateMany', preventledgerModification);
ledgerSchema.pre('findOneAndRemove', preventledgerModification);


const ledgerModel=mongoose.model('Ledger',ledgerSchema);

module.exports=ledgerModel;

