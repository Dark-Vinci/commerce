const { User } = require('../../model/userM');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

describe ('auth token', () => {
    it ('should generate a valid jwt', () => {
        const payload = { _id: mongoose.Types.ObjectId().toHexString() };
        const token = new User(payload).generateToken();

        const decoded = jwt.verify(token, config.get('jwtKey'));

        expect(decoded).toMatchObject(payload)
    })
})