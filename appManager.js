
module.exports = function (app) {
    require('./startup/joi')();
    require('./startup/config')();
    require('./startup/routes')(app);
    require('./startup/logging')();
    require('./startup/db')();
}