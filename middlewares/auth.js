const jwt = require("jsonwebtoken");

module.exports = function verifyJwt(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ message: "unauthorized access" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
    })


}