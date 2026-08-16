const user = require("../model/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../util/jwtGenerate");
const generateVerificationToken = require("../util/generateVerificationToken");
const { sendVerificationEmail } = require("../util/emailService");

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

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = new user({
            name,
            email,
            password: hashedpassword,
            role,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
            isEmailVerified: false
        });
        await newUser.save();

        // Send verification email
        let emailSent = true;
        try {
            await sendVerificationEmail(email, verificationToken, name);
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            emailSent = false;
        }

        return res.status(201).json({
            message: emailSent
                ? "Account created successfully! We sent a verification link to your email."
                : "Account created successfully, but we could not send the verification email immediately. Please use the resend button.",
            email,
            emailSent
        });
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
                message: "Invalid credentials"
            });
        }
        const comparePass = await bcrypt.compare(password, foundUser.password);
        if(!comparePass) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Check if email is verified
        if (!foundUser.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email address before logging in.",
                emailVerificationRequired: true,
                email: foundUser.email
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

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }

        // 1. Check for active unverified token
        const foundUser = await user.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (foundUser) {
            foundUser.isEmailVerified = true;
            foundUser.lastVerifiedToken = token;
            foundUser.lastVerifiedAt = new Date();
            foundUser.emailVerificationToken = undefined;
            foundUser.emailVerificationExpires = undefined;
            await foundUser.save();

            return res.status(200).json({
                message: "Email verified successfully! You can now log in."
            });
        }

        // 2. Check if this token was already used to verify the account (handles StrictMode, double-clicks, reloads)
        const alreadyVerifiedUser = await user.findOne({
            lastVerifiedToken: token
        });

        if (alreadyVerifiedUser && alreadyVerifiedUser.isEmailVerified) {
            return res.status(200).json({
                message: "Your email is already verified! You can log in."
            });
        }

        return res.status(400).json({
            message: "Invalid or expired verification link. Please request a new verification email."
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    try {
        let { email } = req.body;

        email = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address." });
        }

        const foundUser = await user.findOne({ email });

        if (!foundUser) {
            return res.status(404).json({ message: "No account found with this email address." });
        }

        if (foundUser.isEmailVerified) {
            return res.status(400).json({ message: "This email address is already verified. You can sign in." });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        foundUser.emailVerificationToken = verificationToken;
        foundUser.emailVerificationExpires = verificationExpires;
        await foundUser.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken, foundUser.name);
            return res.status(200).json({
                message: "Verification email sent. Please check your inbox and spam folder."
            });
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            return res.status(500).json({
                message: "Failed to send verification email. Please try again in a few moments."
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
