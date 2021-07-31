

module.exports = function (req, res, next) {
    const isSuper = req.user.superAdmin;
    
    if (!isSuper) {
        return res.status(403).json({
            status: 403,
            message: "unAuthorized, no try again, oga go kill you"
        })
    } else {
        next();
    }
}