const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { 
    Admin, validate, validateIn,
    validatePut, validatePass 
} = require('../model/admin');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/requestBodyVerifier');
const idValidator = require("../middleware/idVerifier");

const router = express.Router();

const adminMiddle = [ auth, admin ];
const idAndSuperAdminMiddle = [ 
    idValidator, auth, 
    admin, superAdmin 
];
const idAndAdminMiddleware = [ idValidator, auth, admin ];
const adminBodyMiddlewarePut = [ auth, admin, bodyValidator(validatePut) ]
const adminBodyMiddleware = [ auth, admin, bodyValidator(validatePass) ]

router.get('/', adminMiddle, wrapper ( async (req, res) => {
    const admins = await Admin.find()
        .select({ password: 0 });

    res.status(200).json({
        status: 200,
        message: "success",
        data: admins
    })
}));

router.get('/:id', idAndAdminMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    if (id != req.user._id && !req.user.superAdmin) {
        return res.status(403).json({
            status: 403,
            message: 'youre not allowed here'
        });
    }

    const admin = await Admin.findById(id)
        .select({ password: 0 });

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: "no such admin in the db..."
        });
    } else {
        res.status(200).json({
            status: 200,
            message: "success",
            data: admin
        });
    }
}));

router.post('/register', bodyValidator(validate), wrapper ( async (req, res) => {
    const adminNumber = await Admin.find().count();

    if (adminNumber >= 3) {
        return res.status(400).json({
            status: 400,
            message: "we cant have more than 3 admin in the db..."
        });
    } else {
        let { name, email, phoneNumber, password } = req.body;
        let adnim = await Admin.findOne({ email });
        let adin = await Admin.findOne({ phoneNumber });

        if (adnim || adin) {
            return res.status(400).json({
                status: 400,
                message: 'we have a user with same email or password'
            });
        }

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        const admin = new Admin({
            name,
            email,
            phoneNumber,
            password
        });

        if (adminNumber == 0) {
            admin.superAdmin = true;
        }

        try {
            await admin.save();

            const token = admin.generateToken();
            const toSend = _.pick(admin, ['email', 'name', 'phoneNumber', 'superAdmin', '_id']);

            res.header('x-auth-token', token).status(201).json({
                status: 201,
                message: "success",
                data: toSend
            });
        } catch(ex) {
            let message = '';

            for (field in ex.erors) {
                message += " $ " + ex.errors[field];
            }
            
            res.status(400).json({
                status: 400,
                message
            });
        }
    }
}));

router.post('/login', bodyValidator(validateIn), wrapper ( async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
        return res.status(400).json({
            status: 400,
            message: "invalid email or password"
        });
    } else {
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) {
            return res.status(400).json({
                status: 400,
                message: "invalid email or password"
            });
        } else {
            const token = admin.generateToken();

            res.header('x-auth-token', token).status(200).json({
                status: 200,
                message: "success",
                data: 'welcome back admin...'
            });
        }
    }
}));

router.post('/logout', adminMiddle, (req, res) => {
    // ?? must be logged in
    const token = 'goodbye';
    res.header('x-auth-token', token).send('odabo');
});

router.put('/edit', adminBodyMiddlewarePut, wrapper ( async (req, res) => {
    const id  = req.user._id;

    const { name, email, phoneNumber } = req.body;

    const admin1 = await Admin.findOne({ email });
    const admin2 = await Admin.findOne({ phoneNumber });

    if (admin1 || admin2) {
        return res.status(400).json({
            status: 400,
            message: 'someone in the db is using same email or phone number'
        });
    } else {
        const admin = await Admin.findById(id);

        admin.set({
            name: name || admin.name,
            email: email || admin.email,
            phoneNumber: phoneNumber || admin.phoneNumber
        })
        await admin.save();

        const toSend = _.pick(admin, [
                'name', 'phoneNumber', 
                'id', 'email', 'superAdmin'
            ]
        );

        res.status(200).json({
            status: 200,
            message: "success",
            data: toSend
        });
    }
}));

router.put('/change-password', adminBodyMiddleware, wrapper ( async (req, res) => {
    const id = req.user._id;

    const admin = await Admin.findById(id);

    let { oldPassword, newPassword } = req.body;
    const isValid = await bcrypt.compare(oldPassword, admin.password);

    if (!isValid) {
        return res.status(400).json({
            status: 400,
            message: 'something is wrong with either of the supplied values'
        });
    } else {
        const toReturn = newPassword;
        const salt = await bcrypt.genSalt(10);
        newPassword = await bcrypt.hash(newPassword, salt);

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({
            status: 200,
            message: "success",
            data: `your new password is ${ toReturn }`
        });
    }
}));

router.delete('/:id', idAndSuperAdminMiddle, wrapper ( async (req, res) => {
    const { id } = req.params;

    const admin = await Admin.findByIdAndRemove(id);

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such admin in the db..'
        });
    } else {
        const toSend = _.pick(admin, ['email', 'phoneNumber', 'name'])
        res.status(200).json({
            status: 200,
            message: "success",
            data: toSend
        });
    }
}));

module.exports = router;