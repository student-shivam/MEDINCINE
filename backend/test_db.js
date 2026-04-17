const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    console.log('Connecting to:', uri);
    try {
        await mongoose.connect(uri);
        console.log('✔ MongoDB Connected');
        process.exit(0);
    } catch (error) {
        console.error('✘ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

connectDB();
