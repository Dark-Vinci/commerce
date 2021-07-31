const express = require('express');
const router = express.Router();

const { Home, validate, validatePut } = require('../model/home');
const { Product } = require('../model/product');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const utils = require('../utils/getRandom');

const bodyValidator = require('../middleware/requestBodyVerifier');
const idValidator = require("../middleware/isValidator");

const idAndBodyMiddleware = [ idValidator, bodyValidator(validatePut) ];
const adminBodyMiddleware = [ auth, admin, bodyValidator(validate) ]
const adminMiddleware = [ auth, admin ];
const idAndAdminMiddleware = [ idValidator, auth, admin ]

router.get('/', wrapper (async (req, res) => {
    const homes = await Home.find({ isPublished: true })
        .sort({ createdAt: -1 });
    const home = homes[0];

    const products = await Product.find();

    const productsToReturn = [];
    for (let item of utils(12, 0, products.length)) {
        productsToReturn.push(products[item]);
    }

    if (homes.length == 0) {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: productsToReturn
        });
    } else {
        const toSend = [ home, productsToReturn ];

        res.status(200).json({
            status: 200,
            message: 'success',
            data: toSend
        });
    }
}));

router.get('/all', adminMiddleware, wrapper( async (req, res) => {
    const homes = await Home.find()
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: homes
    });
}));

router.get('/all-published', adminMiddleware, wrapper(async (req, res) => {
    const homes = await Home.find({ isPublished: true })
        .sort({ createdAt: -1 })    

    res.status(200).json({
        status: 200,
        message: 'success',
        data: homes
    });
}));

router.get('/all-non-published',adminMiddleware, wrapper( async (req, res) => {
    const homes = await Home.find({ isPublished: false })
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: homes
    });
}));

router.get('/:id', idAndAdminMiddleware, wrapper( async (req, res) => {
    const { id } = req.params;
    const home = await Home.findById(id);

    if (!home) {
        return res.status(404).json({
            status: 404,
            message: 'no such home withe the given id'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

router.post('/', adminBodyMiddleware, wrapper( async (req, res) => {
    const { header, body1, body2, quote, isPublished } = req.body;

    const home = new Home({
        header,
        body1,
        body2,
        quote,
        isPublished
    });

    await home.save();

    res.status(200).json({
        status: 200,
        message: 'success',
        data: home
    });
}));

router.put('/:id', idAndBodyMiddleware, wrapper( async (req, res) => {
    const { id } = req.params;
    const home = await Home.findById(id);

    if (!home) {
        return res.status(404).json({
            status: 404,
            message: 'no such home object the the db'
        });
    } else {
        if (home.isPublished) {
            return res.status(400).json({
                status: 400,
                message: 'this home is already published, cant be modified'
            });
        } else {
            const { header, body1, body2, quote, isPublished } = req.body;
            home.set({ 
                header: header || home.header,
                body1: body1 || home.body1,
                body2: body2 || home.body2,
                quote: quote || home.quote,
                isPublished: isPublished || home.isPublished
            });

            await home.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: home
            });
        }
    }
}));

router.delete('/:id', idAndAdminMiddleware, wrapper( async (req, res) => {
    const { id } = req.params;

    const home = await Home.findByIdAndRemove(id);
    if (!home) {
        return res.status(404).json({
            status: 404,
            message: 'no such home with the given id in the db'
        });
    } else {
        return res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

module.exports = router;