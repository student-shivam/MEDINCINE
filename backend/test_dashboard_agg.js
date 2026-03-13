const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Sale = require('./models/Sale');
const Medicine = require('./models/Medicine');

async function testControllerLogic() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        console.log('Testing aggregation since:', startOfToday.toISOString());

        const todayStats = await Sale.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$grandTotal' },
                    orders: { $sum: 1 }
                }
            }
        ]);

        console.log('Aggregation Result:', JSON.stringify(todayStats, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

testControllerLogic();
