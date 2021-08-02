const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const orderSchema = require('./order');

const userSchema = new Schema({
    firstName: {
        type: String,
        minlength: 2,
        maxlength: 30,
        required: true
    },

    lastName: {
        type: String,
        minlength: 2,
        maxlength: 30,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 16,
        trim: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        min: 5,
        maxlength: 100,
        unique: true
    },

    address: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 200
    },

    password: {
        type: String,
        minlength: 10,
        maxlength: 1024,
        required: true
    },

    cart: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Product'
    },

    orders: {
        type: [ orderSchema ]
    }
});

userSchema.methods.generateToken = function () {
    const token = jwt.sign({ _id: this._id }, config.get('jwtKey'));
    return token;
}

const User = mongoose.model('User', userSchema);

function validate(inp) {
    const schema = Joi.object({
        firstName: Joi.string()
            .required()
            .min(2)
            .max(30),

        lastName: Joi.string()
            .required()
            .min(2)
            .max(30),

        phoneNumber: Joi.string()
            .required()
            .min(11)
            .max(16),

        email: Joi.string()
            .email()
            .required()
            .min(5)
            .max(200),

        password: Joi.string()
            .required()
            .min(7)
            .max(100),

        address: Joi.string()
            .required()
            .min(10)
            .max(200),
    });

    const result = schema.validate(inp);
    return result;
}

function validatePut(inp) {
    const schema = Joi.object({
        firstName: Joi.string()
            .min(2)
            .max(30),

        lastName: Joi.string()
            .min(2)
            .max(30),

        phoneNumber: Joi.string()
            .min(11)
            .max(16),

        email: Joi.string()
            .min(5)
            .max(200),

        address: Joi.string()
            .min(10)
            .max(200)
    });

    const result = schema.validate(inp);
    return result;
}

function validatePassword(inp) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .min(7)
            .max(100),

        newPassword: Joi.string()
            .required()
            .min(7)
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

function validateLogin(inp) {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .min(7)
            .max(100),

        password: Joi.string()
            .required()
            .min(7)
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    User,
    validate,
    userSchema,
    validatePut,
    validateLogin,
    validatePassword,
}