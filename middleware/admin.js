
module.exports = function (req, res, next) {
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
        return res.status(403).json({
            status: 403,
            message: "unAuthorized, please dont try again"
        })
    } else {
        next();
    }
}