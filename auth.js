const JWT_SECRET = "Iwannadoit";
const jwt = require("jsonwebtoken");
function auth(req, res, next) {
    try {
        const token = req.headers.token;
        const decode = jwt.verify(token, JWT_SECRET);
        if (decode) {
            req.userId = decode.id;
            console.log(req.userId)
            console.log("Auth success")
            next();
        } else {
            res.status(403).json({
                message: "You are not logged in"
            })
        }

    } catch (error) {
        res.status(403).json({
            message: "You are not logged in"
        })
    }
}

module.exports = {
    auth,
    JWT_SECRET,
}