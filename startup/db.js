const mongoose = require('mongoose');
const winston = require('winston');

module.exports = function () {
    mongoose.connect('mongodb://localhost/ecom', {
        useUnifiedTopology: true,  
        useNewUrlParser: true,
        useFindAndModify: false
    })
        .then(() => winston.info('connected to the database..'))
}