

module.exports = function (err, req, res, next) {
    res.status(500).json({
        status: 500,
        message: "something went wrong on the server, dont panic"
    });
}