const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

module.exports = function () {
    const db = config.get('db');
    
    mongoose.connect(db, {
        useUnifiedTopology: true,  
        useNewUrlParser: true,
        useFindAndModify: false
    })
        .then(() => winston.info(`connected to the ${ db } database..`));
}