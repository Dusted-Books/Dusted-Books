const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    bookTitle: {
      type: String,
      required: true,
      trim: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    price: {
      type: Number,
      default: null,
    },
    adminMessage: {
      type: String,
      default: "",
    },
  },
  { collection: "bookRequests", timestamps: true }
);

// Customers look up their own requests, newest first
bookRequestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("BookRequest", bookRequestSchema);
