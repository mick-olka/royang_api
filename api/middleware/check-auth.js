
module.exports = (req, res, next) => {
    try {
        if (req.cookies.data) {
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