const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');



async function authMiddleware(req, res, next) {
    const token= req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({message:'Unauthorized: No token provided'});
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token: token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
    }

    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        const user= await userModel.findById(decoded.id);
        if(!user){
            return res.status(401).json({message:'Unauthorized: User not found'});
        }
        req.user= user;
        next();

    }catch(error){
        console.error(error);
        return res.status(401).json({message:'Unauthorized: Invalid token'});

    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token= req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({message:'Unauthorized: No token provided'});
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token: token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
    }
    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        const user= await userModel.findById(decoded.id).select('+systemUser');
        if(!user || !user.systemUser){
            return res.status(401).json({message:'Unauthorized: System user required'});
        }
        req.user= user;
        next();
    }catch(error){
        console.error(error);
        return res.status(401).json({message:'Unauthorized: Invalid token'});
    }
}


module.exports = { authMiddleware, authSystemUserMiddleware };