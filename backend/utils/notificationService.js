const Notification = require('../models/Notification');
const socket = require('./socket');

/**
 * Creates and emits a notification if a similar unread notification doesn't exist.
 */
const createNotification = async (type, message, medicineId) => {
    try {
        let io = null;

        try {
            io = socket.getIO();
        } catch (socketError) {
            console.warn('[NOTIFICATION] Socket.io not initialized, storing notification without emit.');
        }

        const existingNotification = await Notification.findOne({
            medicineId,
            type,
            isRead: false,
        });

        if (existingNotification) return;

        const notification = await Notification.create({
            type,
            message,
            medicineId,
        });

        if (io) {
            io.emit('new_notification', {
                _id: notification._id,
                type,
                message,
                medicineId,
                createdAt: notification.createdAt,
                isRead: false
            });
        }

        console.log(`[NOTIFICATION] Emitted ${type} for medicine ${medicineId}`);
    } catch (error) {
        console.error('[NOTIFICATION] Error creating/emitting notification:', error.message);
    }
};

const checkStockAndNotify = async (medicine) => {
    if (medicine.stock <= 0) {
        await createNotification(
            'out_of_stock',
            `Medicine "${medicine.name}" is out of stock!`,
            medicine._id
        );
    } else if (medicine.stock <= medicine.lowStockThreshold) {
        await createNotification(
            'low_stock',
            `Medicine "${medicine.name}" is running low on stock (${medicine.stock} left).`,
            medicine._id
        );
    }
};

const checkExpiryAndNotify = async (medicine) => {
    const now = new Date();
    const expiryDate = new Date(medicine.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (expiryDate < now) {
        await createNotification(
            'expired',
            `Medicine "${medicine.name}" has expired!`,
            medicine._id
        );
    } else if (expiryDate <= thirtyDaysFromNow) {
        const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        await createNotification(
            'near_expiry',
            `Medicine "${medicine.name}" will expire in ${daysRemaining} days.`,
            medicine._id
        );
    }
};

module.exports = {
    checkStockAndNotify,
    checkExpiryAndNotify
};
