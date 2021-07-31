const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');

const login = require('../routes/login');
const register = require('../routes/register');
const users = require('../routes/users');
const order = require('../routes/buy');
const product = require('../routes/products');
const admin = require('../routes/admin');
const search = require('../routes/search');
const home = require('../routes/home');
const error = require('../middleware/error');


module.exports = function (app) {
    if (app.get('env') == 'development') {
        app.use(morgan('tiny'));
    }

    app.use(helmet());  
    app.use(express.json())
    app.use(express.urlencoded({ extended: false  }));

    app.use('/api/login', login)
    app.use('/api/register', register);
    app.use('/api/users', users);
    app.use('/api/order', order);
    app.use('/api/product', product);
    app.use('/api/admin', admin);
    app.use('/api/search', search);
    app.use('/api/home', home);

    app.use(error);
}