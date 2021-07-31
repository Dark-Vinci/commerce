const config = require('config');

module.exports = function () {
    if (!config.get('jwtKey')) {
        throw new Error('jwt key is missing');
    }
}