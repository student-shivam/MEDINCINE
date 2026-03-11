const { getMedicines } = require('./controllers/medicineController');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const runTest = async () => {
    try {
        await connectDB();

        const req = {
            query: { page: 1, limit: 10 },
            user: undefined // Simulate public request
        };
        const res = {
            status: (code) => ({
                json: (data) => console.log('Success:', code, data)
            })
        };
        const next = (err) => {
            console.error('CRASH DETECTED:');
            console.error(err);
            process.exit(1);
        };

        await getMedicines(req, res, next);
        process.exit(0);
    } catch (err) {
        console.error('UNEXPECTED ERROR:');
        console.error(err);
        process.exit(1);
    }
};

runTest();
