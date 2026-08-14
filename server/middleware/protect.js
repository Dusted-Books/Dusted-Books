const jwt = require("jsonwebtoken");

const protect = (req, res, next)=> {
    const token = req.cookies.token;
    if(!token) {
        return res.status(401).json({
            message: "Not authorized no token"
        });
    }
    try {
        const decoded = jwt.verify(
            token, process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    }catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired. Please log in again."
            });
        }
        return res.status(401).json({
            message: "Token is invalid."
        });
    }
};

module.exports = protect;
