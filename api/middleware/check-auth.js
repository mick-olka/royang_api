const { getKey } = require("../routes/admin");

module.exports = (req, res, next) => {
    try {
        if (req.cookies.data===getKey()) {
            next();
        } else {
            res.status(401).json({
                message: "NEED_TO_LOGIN"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "AUTH FAILED FROM MIDDLEWARE"
        });
    }
};