const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicine';
    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI not defined; falling back to local mongodb://127.0.0.1:27017/medicine');
    }

    try {
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`\x1b[36m%s\x1b[0m`, `✔ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`\x1b[31m%s\x1b[0m`, `✘ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
