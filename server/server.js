require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { sanitize } = require("express-mongo-sanitize");
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser");

// Fail loudly if the JWT secret is missing — otherwise tokens would be
// signed/verified with `undefined`.
if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET is not set. Add it to server/.env before starting.");
    process.exit(1);
}

const app = express();
connectDB();

//middleware
app.use(helmet());
app.use(cors({
    origin: process.env.client_url,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Strip Mongo operators ($, .) from user-supplied input.
// express-mongo-sanitize's default middleware reassigns req.query, which is a
// read-only getter in Express 5, so sanitize body/params manually instead.
app.use((req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params);
    next();
});

// Throttle brute-force attempts on auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later." },
});
app.use("/api/users/login", authLimiter);
app.use("/api/users/signup", authLimiter);

app.use("/api", require("./routes/authRoute"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/bookRoutes"));
app.use("/api", require("./routes/bookRequestRoutes"));


//test route
app.get("/", (req, res) => {
    res.send("API is running...")
});

// Global error handler — keeps stack traces out of responses.
// Multer errors (e.g. file too large, bad file type) surface as 400s.
app.use((err, req, res, next) => {
    if (err.name === "MulterError" || err.code === "INVALID_FILE_TYPE") {
        return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> {
    console.log(`Server is running on PORT ${PORT}`);
})
