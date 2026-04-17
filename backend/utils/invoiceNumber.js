const Counter = require('../models/Counter');

const buildPeriod = (date = new Date()) => {
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
};

const getNextInvoiceNumber = async ({ prefix, session, date = new Date() }) => {
    const period = buildPeriod(date);
    const counterKey = `${prefix}-${period}`;

    const counter = await Counter.findOneAndUpdate(
        { key: counterKey },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true,
            session,
            setDefaultsOnInsert: true,
        }
    );

    return `${prefix}-${period}-${String(counter.seq).padStart(5, '0')}`;
};

module.exports = {
    getNextInvoiceNumber,
};
