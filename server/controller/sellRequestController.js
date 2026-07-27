const cloudinary = require("../config/cloudinary");
const SellRequest = require("../model/sellRequest");

// Helper: upload a buffer to Cloudinary
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "Sell_Request_Images",
        transformation: [
          { width: 600, height: 800, crop: "limit" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// POST /api/sell-requests
exports.createSellRequest = async (req, res) => {
  try {
    const { sellType, seriesPrice, location, contactNumber, books } = req.body;

    // Parse books JSON string (sent as multipart/form-data)
    let parsedBooks;
    try {
      parsedBooks = typeof books === "string" ? JSON.parse(books) : books;
    } catch {
      return res.status(400).json({ message: "Invalid books data." });
    }

    // Validate sell type
    if (!["individual", "series"].includes(sellType)) {
      return res.status(400).json({ message: "sellType must be 'individual' or 'series'." });
    }

    // Validate shared fields
    if (!location || !location.trim())
      return res.status(400).json({ message: "Pickup address is required." });
    if (!contactNumber || !contactNumber.trim())
      return res.status(400).json({ message: "Contact number is required." });

    // Validate books array
    if (!Array.isArray(parsedBooks) || parsedBooks.length === 0)
      return res.status(400).json({ message: "At least one book is required." });

    // Series: validate the single shared price
    let parsedSeriesPrice = null;
    if (sellType === "series") {
      parsedSeriesPrice = Number(seriesPrice);
      if (!seriesPrice || isNaN(parsedSeriesPrice) || parsedSeriesPrice < 0)
        return res.status(400).json({ message: "A valid series price is required." });
    }

    // Validate each book entry
    for (let i = 0; i < parsedBooks.length; i++) {
      const b = parsedBooks[i];
      if (!b.bookTitle || !b.bookTitle.trim())
        return res.status(400).json({ message: `Book ${i + 1}: title is required.` });
      if (!b.authorName || !b.authorName.trim())
        return res.status(400).json({ message: `Book ${i + 1}: author name is required.` });
      if (sellType === "individual") {
        const p = Number(b.price);
        if (b.price === undefined || b.price === "" || isNaN(p) || p < 0)
          return res.status(400).json({ message: `Book ${i + 1}: a valid price is required.` });
      }
    }

    // Upload photos (one per book, positional)
    const files = req.files || [];
    const photoUrls = await Promise.all(
      parsedBooks.map(async (_, i) => {
        const file = files[i];
        if (file && file.size > 0) return await uploadToCloudinary(file.buffer);
        return "";
      })
    );

    const bookEntries = parsedBooks.map((b, i) => ({
      bookTitle: b.bookTitle.trim(),
      authorName: b.authorName.trim(),
      photoUrl: photoUrls[i] || "",
      price: sellType === "individual" ? Number(b.price) : null,
    }));

    const newRequest = await SellRequest.create({
      userId: req.user.id,
      userEmail: req.user.email,
      sellType,
      seriesPrice: parsedSeriesPrice,
      location: location.trim(),
      contactNumber: contactNumber.trim(),
      books: bookEntries,
    });

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/sell-requests/my  — customer
exports.getMySellRequests = async (req, res) => {
  try {
    const requests = await SellRequest.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/sell-requests  — admin
exports.getAllSellRequests = async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/sell-requests/:id  — admin status update
exports.updateSellRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const allowed = ["approved", "denied", "pickup_confirmed", "trade_accepted", "trade_denied"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}.` });

    const updated = await SellRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes: adminNotes ? adminNotes.trim() : "" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Sell request not found." });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
