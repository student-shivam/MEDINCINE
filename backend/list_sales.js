const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Sale = require('./models/Sale');

async function listAllSales() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const sales = await Sale.find().sort({ createdAt: -1 });
        console.log(`Total Sales in collection: ${sales.length}`);

        sales.forEach((s, i) => {
            console.log(`[${i + 1}] ${s.invoiceNumber} | Total: ${s.grandTotal} | Created: ${s.createdAt}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listAllSales();
