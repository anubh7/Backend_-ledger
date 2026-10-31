const mongoose = require('mongoose');

const tokenblacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required:[true, 'Token is required'],
        unique: [true, 'Token must be unique']
    },
    
},{
    timestamps: true //means createdAt and updatedAt fields will be automatically added to the schema
});

tokenblacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600*24*3 }); //means token will be automatically removed from the collection after 3 days (3600 seconds * 24 hours * 3 days)

const tokenblacklistModel = mongoose.model('TokenBlacklist', tokenblacklistSchema);

module.exports =  tokenblacklistModel;