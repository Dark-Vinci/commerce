const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { User, validateLogin } = require('../model/userM');
const wrapper = require('../middleware/wrapper'); 
const bodyValidator = require('../middleware/requestBodyVerifier');

router.post('/', bodyValidator(validateLogin), wrapper ( async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    
    if (!user) {
        return res.status(400).json({
            status: 400,
            message: 'invalid username or password'
        });
    } else {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({
                status: 400,
                message: 'invalid username or password'
            });
        } else {
            const token = user.generateToken();
            res.header("x-auth-token", token)
                .status(200)
                .json({
                    status: 200,
                    message: "success",
                    data: "welcome back user..."
                })
        }
    }
}));

module.exports = router;