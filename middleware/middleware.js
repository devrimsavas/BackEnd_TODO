

const jwt = require('jsonwebtoken');
const jsend=require('jsend');

const isAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.jsend.fail({
            statusCode: 401,
            message: "Unauthorized access. No token provided."
        });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.jsend.fail({
                statusCode: 401,
                message: "Unauthorized access. Token is invalid."
            });
        }

        if (!decoded || !decoded.id) {
            return res.jsend.fail({
                statusCode: 401,
                message: "Unauthorized access. Token is valid but no user found."
            });
        }

        req.user = decoded;
        next();
    });
};

module.exports = isAuth;
