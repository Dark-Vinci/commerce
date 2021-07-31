const express = require('express');
const router = express.Router();

const { Product, validateSearch } = require('../model/product');
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/requestBodyVerifier');

router.post('/', bodyValidator(validateSearch), wrapper ( async (req, res) => {
    const { input } = req.body;
    const toSearch = `.*${ input }.*` ;
    
    const result = await Product.find()
            .or([{ name: { $regex: toSearch }},
            { description: { $regex: toSearch }},
            { slug: { $regex: toSearch }}])
        .sort({ price : -1 })
        .select({ review: 0, cloudinaryId: 0 })

    if (result.length == 0) {
        return res.status(404).json({
            status: 404,
            message: 'there is no such product on the server'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: result
        });
    }
}));

module.exports = router;