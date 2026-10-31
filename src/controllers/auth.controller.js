const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');


/** 
 *  - userRegister controller
 *  - POST /api/auth/register
 */
async function userRegister(req, res) {
    try {
        const { username, email, password } = req.body;

        // 1. Validate missing fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        // 2. Check if the user already exists (email OR username)
        const existingUser = await userModel.findOne({
            $or: [ { email: email }, { username: username } ]
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Create a new user
        const newUser = await userModel.create({ username, email, password });

        // 4. Check JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is missing in .env' });
        }

        const token = jwt.sign({ id: newUser._id, role: 'user' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        res.cookie('token', token)

        // Send registration email BEFORE responding, so failure can be reported
        let emailSent = true;
        try {
            await emailService.sendRegistrationEmail(newUser.email, newUser.username);
        } catch (mailErr) {
            emailSent = false;
            console.error('Registration email failed:', mailErr.message);
        }

        res.status(201).json({ message: 'User created successfully', emailSent, user:{
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        },
        token: token});
    }
    catch (error) {
        console.error(error);
        // 5. Show REAL error instead of only "Server error"
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: Object.values(error.errors)[0].message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * - userLogin controller
 * - POST /api/auth/login
 * - This controller is responsible for authenticating a user and generating a JWT token.
 * - It checks if the user exists, compares the provided password with the hashed password in the database,
 *   and returns a JWT token if authentication is successful.
 */

async function userLogin(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password'); // Select the password field explicitly since it's excluded by default

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is missing in .env' });
        }

        const token = jwt.sign({ id: user._id, role: 'user' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        res.cookie('token', token)

        res.status(200).json({ message: 'User logged in successfully', user:{
            id: user._id,
            username: user.username,
            email: user.email
        },
        token: token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * - userLogout controller
 * - POST /api/auth/logout
 * - This controller is responsible for logging out a user and blacklisting their JWT token.
 * - It adds the token to the blacklist collection, which will automatically remove it after 3 days.
 */

async function userLogout(req, res) {
    try {
        const  token  = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(200).json({ message: 'user logged out successfully' });
        }
        res.cookie('token',"");

        // Add the token to the blacklist
        await tokenblacklistModel.create({ token: token });

        res.clearCookie('token');

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { userRegister, userLogin, userLogout };