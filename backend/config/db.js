const mongoose = require('mongoose');

let listenersAttached = false;

const attachConnectionListeners = () => {
    if (listenersAttached) {
        return;
    }

    listenersAttached = true;

    mongoose.connection.on('connected', () => {
        console.log(`\x1b[36m%s\x1b[0m`, `MongoDB connected: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (error) => {
        console.error(`\x1b[31m%s\x1b[0m`, `MongoDB runtime error: ${error.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('\x1b[33m%s\x1b[0m', 'MongoDB disconnected. Waiting for mongoose to reconnect...');
    });
};

const connectDB = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicine';
    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI not defined; falling back to local mongodb://127.0.0.1:27017/medicine');
    }

    try {
        attachConnectionListeners();

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        });
    } catch (error) {
        console.error(`\x1b[31m%s\x1b[0m`, `MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
