const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const { 
    User, validatePut,
    validatePassword
} = require('../model/userM');
const { Product } = require('../model/product');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bodyValidator = require('../middleware/requestBodyVerifier');
const idValidator = require("../middleware/idVerifier");

const adminMiddle = [ auth, admin ];
const adminIdMiddleware = [ idValidator, auth, admin ];
const authAdminIdBodyMiddleware = [ 
    idValidator, auth, 
    admin, bodyValidator(validatePut) 
]
const authIdMiddleware = [ idValidator, auth ];
const authBodyMiddleware = [ 
    auth, bodyValidator(validatePassword) 
];

router.get('/all-customers', adminMiddle, wrapper ( async (req, res) => {
    const users = await User.find()
        .select({ password: 0 });
    
    res.status(200).json({
        status: 200,
        message: 'success',
        data: users
    });
}));

router.get('/me', auth, wrapper ( async (req, res) => {
    const id = req.user._id;

    const user = await User.findById(id)
        .select({ password: 0 });

    if (!user) {
        return res.status(400).json({
            status: 400,
            message: 'bad request, no such user in the db....'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

router.get('/length-of-cart', auth, wrapper ( async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);
    const toReturn = user.cart.length;

    res.status(200).json({
        status: 200,
        message: 'success',
        data: toReturn
    })
}))

router.get('/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id)
        .select({ password: 0 });

    if (!user) {
        return res.status(400).json({
            status: 400,
            message: 'bad request, no such user in the db....'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

router.put('/add-to-cart/:productId', authIdMiddleware, wrapper ( async (req, res) => {
    const id  = req.user._id;
    const { productId } = req.params;

    const user = await User.findById(id);
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(400).json({
            status: 400,
            message:'no such item in the db'
        })
    } else {
        user.cart.push(productId);
        await user.save();
    
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ product.name } has been added to your cart`
        });
    }
}));

router.put('/remove-from-cart/:productId', auth, wrapper ( async (req, res) => {
    const id = req.user._id;
    const { productId } = req.params;

    const user = await User.findById(id);

    const theCart = user.cart;
    const index = theCart.indexOf(productId);

    if (index < 0) {
        return res.status(400).json({
            status: 400,
            message: 'no such item in your cart..'
        })
    } else {
        user.cart.splice(index, 1);
        await user.save();

        res.status(200).json({
            status: 200,
            message: "success",
            data: ` ${ productId } has been removed from your cart..`
        });
    }
}));

router.post('/logout', auth , wrapper ( async (req, res) => {
    const token = "sadly";
    res.header('x-auth-token', token).send('good bye........');
}));

router.put('/edit-user/:id', authAdminIdBodyMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id)
        .select({ password: 0 });

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'no such user in the db...'
        });
    } else {
        const { firstName, lastName, phoneNumber, email, address } = req.body;

        user.set({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            phoneNumber: phoneNumber || user.phoneNumber,
            address: address || user.address,
            email: email || user.email
        })

        await user.save();

        res.status(200).json({
            status: 200,
            message: "success",
            data: user
        })
    }
}));

router.put('/change-password', authBodyMiddleware, wrapper( async (req, res) => {
    const id = req.user._id;

    const user = await User.findById(id);

    let { oldPassword, newPassword } = req.body;
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
        return res.status(400).json({
            status: 400,
            message: 'get your old password right...'
        })
    } else {
        const newPass = newPassword;

        const salt = await bcrypt.genSalt(10);
        newPassword = await bcrypt.hash(newPassword, salt);

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            status: 200,
            message: "success",
            data: `your new password is ${ newPass }`
        })
    }
}));

router.delete('/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndRemove(id);

    if (!user) {
        return res.status(404).json({
            status: 400,
            message: 'no such user in the db...',
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `the user ${ id } has been removed from the db...`
        })
    }
}));

module.exports = router;