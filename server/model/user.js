const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer"
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationToken: {
        type: String
    },

    emailVerificationExpires: {
        type: Date
    },

    lastVerifiedToken: {
        type: String
    },

    lastVerifiedAt: {
        type: Date
    }

}, { collection: "users" });

module.exports = mongoose.model("User", userSchema);