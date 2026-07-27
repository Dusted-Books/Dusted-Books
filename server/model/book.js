const mongoose = require("mongoose");


const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: [String],
        required: true,
        validate: {
            validator: (value) => Array.isArray(value) && value.length > 0,
            message: "At least one category is required",
        },
    },
    condition: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    }

}, { collection: "books", timestamps: true });

// Common browse/query patterns
bookSchema.index({ createdAt: -1 });
bookSchema.index({ category: 1 });
bookSchema.index({ title: 1 });

module.exports = mongoose.model("Book", bookSchema);