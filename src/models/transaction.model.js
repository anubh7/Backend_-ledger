const mongoose=require('mongoose');

const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Account',
        required:true,
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Account',
        required:true,
        index:true
    },
    status:{
        type:String,
        enum:{
            values:['pending','completed','failed','reversed'],
            message:'Status must be one of pending, completed, failed, or reversed'
        },
        default:'pending'
    },
    amount:{
        type:Number,
        required:true,
        min:[0.01,'Amount must be greater than 0']
    },
    idempotencyKey:{
        type:String,
        required:[true,'Idempotency key is required'],
        unique:true,
        index:true
    }

    
},{timestamps:true});

const transactionModel=mongoose.model('Transaction',transactionSchema);

module.exports={transactionModel,
    transactionSchema
};