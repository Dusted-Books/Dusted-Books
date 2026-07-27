const user = require("../model/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../util/jwtGenerate");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.registerUser = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;

        name = typeof name === "string" ? name.trim() : "";
        email = typeof email === "string" ? email.trim().toLowerCase() : "";
        password = typeof password === "string" ? password : "";

        if (name.length < 2 || name.length > 60) {
            return res.status(400).json({ message: "Name must be between 2 and 60 characters." });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address." });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }

        // Check if user with the same email already exists
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt); //password hashing

        const newUser = new user({ name, email, password: hashedpassword, role });
        await newUser.save();
        res.status(200).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        email = typeof email === "string" ? email.trim().toLowerCase() : "";
        password = typeof password === "string" ? password : "";

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const foundUser = await user.findOne({ email });

        if(!foundUser) {
            return res.status(401).json({
                message: "invalid credentials"
            });
        }
        const comparePass = await bcrypt.compare(password, foundUser.password);
        if(!comparePass) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        generateToken(res, foundUser);
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
            },
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
};
