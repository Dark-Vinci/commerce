const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');

const adminSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100,
        unique: true
    },

    phoneNumber: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 15,
        unique: true
    },

    password: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1024
    },

    superAdmin: {
        type: Boolean,
        default: false,
        required: true
    }
});

adminSchema.methods.generateToken = function () {
    let token = jwt.sign({ _id: this._id, superAdmin: this.superAdmin, isAdmin: true }, config.get('jwtKey'));
    return token;
}

const Admin = mongoose.model('Admin', adminSchema);

function validate(inp) {
    const schema = Joi.object({
        name: Joi.string()
            .required()
            .min(5)
            .max(50),

        email: Joi.string()
            .email()
            .required()
            .min(5)
            .max(100),

        phoneNumber: Joi.string()
            .required()
            .min(11)
            .max(15),

        password: Joi.string()
            .required()
            .min(7)
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

function validatePut (inp) {
    const schema = Joi.object({
        name: Joi.string()
            .min(5)
            .max(100),

        email: Joi.string()
            .email()
            .min(5)
            .max(100),

        phoneNumber: Joi.string()
            .min(11)
            .max(15)
    });

    const result = schema.validate(inp);
    return result;
}

function validatePass (inp) {
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

function validateIn (inp) {
    const schema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .min(7)
        .max(50),

    password: Joi.string()
        .required()
        .min(7)
        .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Admin,
    validate,
    validateIn,
    validatePut,
    validatePass,
    adminSchema,
}