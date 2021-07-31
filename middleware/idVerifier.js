const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    const { id } = req.params;

    const isValid = mongoose.Types.ObjectId.isValid;

    if (!isValid(id)) {
        return res.status(404).json({
            status: 400,
            message: "this is an invalid objectId"
        });
    } else {
        next();
    }
}