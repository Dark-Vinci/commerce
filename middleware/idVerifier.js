const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    const q = req.params;
    const id = q.id || q.productId

    const isValid = mongoose.Types.ObjectId.isValid;

    if (!isValid(id)) {
        return res.status(404).json({
            status: 404,
            message: "this is an invalid objectId"
        });
    } else {
        next();
    }
}