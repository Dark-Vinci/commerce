const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

const orderSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    
    quantity: {
        type: Number,
        min: 1,
        default: 1,
        required: true
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    orderTime: {
        type: Date,
        default: Date.now
    },

    fufilled: {
        type: Boolean,
        default: false
    },

    recieved: {
        type: Boolean,
        default: false
    },

    marked: {
        type: Boolean,
        default: false
    }
});

const Order = mongoose.model('Order', orderSchema);

function validate(inp) {
    const schema = Joi.object({
        productId: Joi.objectId()
            .required(),

        quantity: Joi.number()
            .integer()
            .min(1)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Order,
    validate,
    orderSchema
}