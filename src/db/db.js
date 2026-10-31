require('dotenv').config();

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

function connectDB() {
    // Disconnect stale connections first
    mongoose.connection.once('disconnected', () => {
        console.log('MongoDB disconnected, reconnecting...');
    });

    mongoose.connect(MONGO_URI, {
        maxPoolSize: 10,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 10000
    })
        .then(async () => {
            console.log('MongoDB connected successfully');

            // Verify connection by running a simple command
            try {
                await mongoose.connection.db.admin().ping();
                console.log('MongoDB ping successful');
            } catch (pingErr) {
                console.error('MongoDB ping failed:', pingErr.message);
            }
        })
        .catch(async (err) => {
            console.error('MongoDB connection error:', err.message);

            // Retry in 5 seconds
            console.log('Retrying MongoDB connection in 5 seconds...');
            setTimeout(() => {
                connectDB();
            }, 5000);
        });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('connected', () => {
        console.log('MongoDB is connected and ready');
    });
}

module.exports = connectDB;