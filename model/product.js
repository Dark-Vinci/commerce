const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
const slugify = require('slugify');

const productSchema = new Schema ({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20
    },

    description: {
        type: String,
        required: true,
        minlength: 7,
        maxlength: 50
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    amountInStock: {
        type: Number,
        required: true,
        min: 0
    },

    amountSold: {
        type: Number,
        min: 0,
        default: 0
    },

    slug: {
        type: String,
        minlength: 2,
        maxlength: 20,
        unique: true
    },

    avatar: {
        type: String
    },

    cloudinaryId: {
        type: String
    }
});

productSchema.pre('validate', function (next) {
    if (this.name) {
        this.slug = slugify(this.name, { strict: true, lower: true})
    }

    next();
})

const Product = mongoose.model('Product', productSchema);

function validate(inp) {
    const schema = Joi.object({
        name: Joi.string()
            .required()
            .min(2)
            .max(20),

        price: Joi.number()
            .required()
            .min(0),

        amountInStock: Joi.number()
            .integer()
            .required()
            .min(0),

        description: Joi.string()
            .required()
            .min(7)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}


function validatePut(inp) {
    const schema = Joi.object({
        name: Joi.string()
            .min(2)
            .max(20),

        price: Joi.number()
            .min(0),

        amountInStock: Joi.number()
            .integer()
            .min(0),

        description: Joi.string()
            .min(7)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}



function validateBuy(inp) {
    const schema = Joi.object({
        productId: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

function validateSearch(inp) {
    const schema = Joi.object({
        input: Joi.string()
            .min(1)
            .max(30)
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

function validateCart(inp) {
    const schema = Joi.object({
        cart: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Product,
    validate,
    validatePut,
    validateBuy,
    validateCart,
    productSchema,
    validateSearch,
}