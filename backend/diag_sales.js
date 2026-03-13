const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './.env' });

const SaleSchema = new mongoose.Schema({
    grandTotal: Number,
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const Sale = mongoose.model('Sale', SaleSchema);

async function checkSales() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        console.log('Checking for sales since:', startOfToday.toISOString());

        const sales = await Sale.find({ createdAt: { $gte: startOfToday } });
        console.log(`Found ${sales.length} sales today.`);

        let total = 0;
        sales.forEach((s, i) => {
            console.log(`Sale ${i + 1}: GrandTotal=${s.grandTotal}, CreatedAt=${s.createdAt.toISOString()}`);
            total += (s.grandTotal || 0);
        });

        console.log(`Total Gross for Today calculated by script: ${total}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkSales();
