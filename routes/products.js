const express = require('express');
const router = express.Router();

const cloudinary = require('../middleware/cloudinary');
const upload = require('../middleware/multer');
const { Product, validate, validatePut } = require('../model/product');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const utils = require('../utils/getRandom');

const bodyValidator = require('../middleware/requestBodyVerifier');
const idValidator = require("../middleware/idVerifier");

const adminImageBodyMiddleware = [  
    upload.single("image") 
];

const adminImageBodyMiddlewarePut = [ 
    auth, admin, 
    bodyValidator(validatePut), 
    upload.single("image") 
];
const idAdminMiddleware = [ idValidator, auth, admin ];

router.get('/', wrapper ( async (req, res) => {
    const products = await Product.find();

    const productsToReturn = [];
    for (let item of utils(12, 0, products.length)) {
        productsToReturn.push(products[item]);
    }

    res.status(200).json({
        status: 200,
        message: 'success',
        data: productsToReturn
    });
}));

router.get('/:id', idValidator, wrapper ( async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        return res.status(404).json({
            status: 404,
            message: 'no such product in the dbb...'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: product
        });
    }
}));

router.post('/', adminImageBodyMiddleware , wrapper ( async (req, res) => {
    const { error } = validate(req.body);

    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        })
    }

    const { name, price, amountInStock, description } = req.body;

    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        
        let product = new Product ({
            name,
            price,
            amountInStock,
            description,  
            avatar: result.secure_url,
            cloudinaryIid: result.public_id
        });
        
        await product.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: product
        });
    } catch (ex) {
        res.status(500).json({
            status: 500,
            message: ex
        });
    }
}));

router.put('/restock/:id', idAdminMiddleware,  wrapper ( async (req, res) => {
    const { id } = req.params;
    const { q } = req.query;

    if (!q || !parseInt(q)) {
        return res.status(400).json({
            status: 400,
            message: 'no query parameter or q is not a number'
        });
    } else {
        if (!parseInt(q)) {
            return res.send('you dont know what youre doing bro')
        }

        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(400).json({
                status: 400,
                message: 'no such product in the db'
            });
        } else {
            product.amountInStock += parseInt(q);
            await product.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: `${ product.name } available in stock has been increased by ${ parseInt(q) }`
            });
        }
    }
}));

router.put('/:id', adminImageBodyMiddlewarePut, wrapper ( async (req, res) => {
    const { id } = req.params;

    try {
        let { name, price, description } = req.body;
        let product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                status: 404,
                message: 'no such product in the dbb...'
            });
        } else {
            // await cloudinary.uploader.destroy(product.cloudinary_id);
            const result = await cloudinary.uploader.upload(req.file.path);

            const data = {
                name: name || product.name,
                price: price || product.price,
                description: description || product.description,
                avatar: result.secure_url || product.avatar,
                cloudinary_id: result.public_id || product.cloudinary_id,
            }

            product = await Product.findByIdAndUpdate(id, data, { new: true });

            res.status(200).json({
                status: 200,
                message: 'success',
                data: product
            });
        }
    } catch (ex) {
        res.status(500).json({
            status: 500,
            message: 'something went wrong, dont panic..'
        });
    }
}));

router.delete('/:id', idAdminMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    try {
        let product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                status: 404,
                message: 'no such product in the dbb...'
            });
        } else {
            await cloudinary.uploader.destroy(product.cloudinary_id);
            await product.remove();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: product
            });
        }
    } catch (ex) {
        res.status(500).json({
            status: 500,
            message: 'something went wrong on the server'
        });
    }
}));

module.exports = router;   