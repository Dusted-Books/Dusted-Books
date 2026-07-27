const jwt = require("jsonwebtoken");

const generateToken = (res, user) => {
    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure:  process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
    });
    
}

module.exports = generateToken;