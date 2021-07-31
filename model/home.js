const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

const homeSchema = new Schema({
    header: {
        type: String,
        minlength: 3,
        maxlenghth: 30,
        required: true
    },

    body1: { 
        type: String,
        minlength: 10,
        maxlength: 3000,
        required: true
    },

    body2: { 
        type: String,
        minlength: 10,
        maxlength: 3000
    },

    quote: { 
        type: String,
        minlength: 5,
        maxlength: 200
    },

    isPublished: { 
        type: Boolean,
        default: false,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const Home = mongoose.model('Home', homeSchema);

function validate(inp) {
    const schema = Joi.object({
        header: Joi.string()
            .required()
            .min(3)
            .max(30),

        body1: Joi.string()
            .required()
            .min(10)
            .max(3000),

        body2: Joi.string()
            .min(10)
            .max(3000),

        quote: Joi.string()
            .min(2)
            .max(200),

        isPublished: Joi.boolean()
    });

    const result = schema.validate(inp);
    return result;
}

function validatePut(inp) {
    const schema = Joi.object({
        header: Joi.string()
            .min(3)
            .max(30),

        body1: Joi.string()
            .min(10)
            .max(3000),

        body2: Joi.string()
            .min(10)
            .max(3000),

        quote: Joi.string()
            .min(2)
            .max(200),

        isPublished: Joi.boolean()
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Home,
    validate,
    homeSchema,
    validatePut
}