const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/requestBodyVerifier');
const { User, validate } = require('../model/userM');

const router = express.Router();

router.post('/', bodyValidator(validate), wrapper ( async (req, res) => {
    let { 
        firstName, lastName, 
        phoneNumber, email, 
        password, address 
    } = req.body;

    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);

    const user = new User({
        firstName,
        lastName,
        phoneNumber,
        email,
        address, 
        password
    });

    await user.save();
    const token = user.generateToken();
    const toReturn = _.pick(user, [
        'firstName', 'lastName', 
        'phoneNumber', 'email'
    ]);
        
    res.header('x-auth-token', token)
        .status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
}));

module.exports = router;