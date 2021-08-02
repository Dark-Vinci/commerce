const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const { Admin } = require('../../model/admin');

describe('admin jwt', () => {
    it ('should generate a valid jwt for admin', () => {
        const payload = { 
            _id: mongoose.Types.ObjectId().toHexString(),
            superAdmin: true,
            isAdmin: true
        }

        const token = new Admin(payload).generateToken();

        const decoded = jwt.verify(token, config.get('jwtKey'));

        expect(decoded).toMatchObject(payload);
    });
});