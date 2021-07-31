const { Schema } = require('mongoose');

const reviewSchema = new Schema ({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 12
    },
    
    review: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 70
    }
});

module.exports = reviewSchema;