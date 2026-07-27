const mongoose = require("mongoose");

const bookEntrySchema = new mongoose.Schema(
  {
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
    photoUrl: {
      type: String,
      default: "",
    },
    // Only used when sellType === "individual"
    price: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const sellRequestSchema = new mongoose.Schema(
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
    // "individual" = each book has its own price
    // "series"     = all books share one bundled price
    sellType: {
      type: String,
      enum: ["individual", "series"],
      required: true,
    },
    // Only used when sellType === "series"
    seriesPrice: {
      type: Number,
      default: null,
    },
    // Pickup address (plain text)
    location: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    books: {
      type: [bookEntrySchema],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least one book is required.",
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "denied",
        "pickup_confirmed",
        "trade_accepted",
        "trade_denied",
      ],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  { collection: "sellRequests", timestamps: true }
);

// Customers look up their own sell requests, newest first
sellRequestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("SellRequest", sellRequestSchema);
