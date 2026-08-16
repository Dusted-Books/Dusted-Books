require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { sanitize } = require("express-mongo-sanitize");
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser");

// Environment validation
const requiredEnvVars = ['JWT_SECRET', 'mongodb_URI', 'client_url'];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error("Add them to server/.env before starting. See .env.example for reference.");
    process.exit(1);
}

const app = express();
connectDB();

//middleware
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false
}));

// Enable gzip compression for all responses
app.use(compression());

// CORS configuration with multiple origins support
const allowedOrigins = process.env.client_url.split(',').map(url => url.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Strip Mongo operators ($, .) from user-supplied input.
// express-mongo-sanitize's default middleware reassigns req.query, which is a
// read-only getter in Express 5, so sanitize body/params manually instead.
app.use((req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params);
    next();
});

// Health check endpoint for hosting platforms
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Throttle brute-force attempts on auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later." },
});

// API Routes
app.use("/api", require("./routes/authRoute"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/bookRoutes"));
app.use("/api", require("./routes/bookRequestRoutes"));

if (process.env.NODE_ENV === "production") {
    const path = require("path");
    const distPath = path.join(__dirname, "../client/dusted-books-app/dist");

    // Serve the built React app
    app.use(express.static(distPath));

    // Any non-API route falls through to index.html for React Router
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
} else {
    // test route — dev only, since "*" above would otherwise shadow it
    app.get("/", (req, res) => {
        res.send("API is running...");
    });
}

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

const server = app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
