const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const { checkStockAndNotify, checkExpiryAndNotify } = require('./notificationService');

/**
 * Scheduled job to check all medicines for stock levels and expiry dates.
 * Runs every day at midnight (00:00).
 */
const startNotificationCron = () => {
    // Cron schedule: 0 0 * * * (Every midnight)
    // For testing/demo, use: */30 * * * * (Every 30 minutes)
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running automated stock & expiry audit...');

        try {
            const medicines = await Medicine.find();

            for (const medicine of medicines) {
                await checkStockAndNotify(medicine);
                await checkExpiryAndNotify(medicine);
            }

            console.log('[CRON] Automated audit complete.');
        } catch (error) {
            console.error('[CRON] Error during cron audit:', error.message);
        }
    }, {
        timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
    });
};

module.exports = startNotificationCron;
