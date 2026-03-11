const Joi = require('joi');

exports.validateSale = (data) => {
    const schema = Joi.object({
        medicines: Joi.array().items(
            Joi.object({
                medicineId: Joi.string().required(),
                quantity: Joi.number().min(1).required(),
                sellingPrice: Joi.number().optional()
            }).unknown()
        ).min(1).required(),
        paymentMethod: Joi.string().required(),
        discount: Joi.any(),
        discountType: Joi.string().optional(),
        discountValue: Joi.number().optional(),
        gstRate: Joi.number().min(0).max(100).optional(),
        amountReceived: Joi.number().min(0).optional(),
        returnAmount: Joi.number().optional(),
        storeId: Joi.string().allow('', null).optional(),
        customerName: Joi.string().allow('', null).optional(),
        customerMobile: Joi.string().allow('', null).optional()
    }).unknown();
    return schema.validate(data);
};
