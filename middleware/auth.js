const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "no token was provided"
        })
    } else {
        try {
            const decoded = jwt.verify(token, config.get('jwtKey'));
            
            req.user = decoded;
            next();
        } catch (ex) {
            return res.status(400).json({
                status: 400,
                message: "invalid token was provided"
            })
        }
    }
}