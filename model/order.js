const { Schema } = require('mongoose');
const mongoose = require('mongoose')

const orderSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },

    amount: {
        type: Number,
        default: 1,
        min: 1,
        required: true
    },

    recieved: {
        type: Boolean,
        default: false
    },

    dateToRecieve: {
        type: String,
        minlength: 5,
        maxlength: 100
    }
});

module.exports = orderSchema;