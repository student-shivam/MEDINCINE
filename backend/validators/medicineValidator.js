const Joi = require('joi');

exports.validateMedicine = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim().required(),
        categoryId: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
        subcategoryId: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.valid(null), Joi.valid('')).optional(),
        brand: Joi.string().trim().required(),
        price: Joi.number().min(0).required(),
        stock: Joi.number().integer().min(0).required(),
        genericName: Joi.string().allow('').optional(),
        category: Joi.string().allow('').optional(),
        batchNumber: Joi.string().allow('').optional(),
        barcode: Joi.string().allow('').optional(),
        quantity: Joi.number().integer().min(0).optional(),
        unitPrice: Joi.number().min(0).optional(),
        purchasePrice: Joi.number().min(0).optional(),
        sellingPrice: Joi.number().min(0).optional(),
        expiryDate: Joi.date().required(),
        manufacturer: Joi.string().allow('').optional(),
        supplier: Joi.string().required(),
        description: Joi.string().allow('').optional(),
        image: Joi.string().allow('').optional(),
        storageLocation: Joi.string().allow('').optional(),
        lowStockThreshold: Joi.number().integer().min(0).optional(),
        assignedPharmacist: Joi.string().allow(null, '').optional(),
        createdBy: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
    });
    return schema.validate(data, { abortEarly: false });
};
