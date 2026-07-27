const BookRequest = require("../model/bookRequest");

// POST /api/book-requests  — customer creates a request
exports.createRequest = async (req, res) => {
  try {
    const { bookTitle, authorName, note } = req.body;

    if (!bookTitle || !bookTitle.trim()) {
      return res.status(400).json({ message: "Book title is required." });
    }
    if (!authorName || !authorName.trim()) {
      return res.status(400).json({ message: "Author's name is required." });
    }

    const newRequest = await BookRequest.create({
      userId: req.user.id,
      userEmail: req.user.email,
      bookTitle: bookTitle.trim(),
      authorName: authorName.trim(),
      note: note ? note.trim() : "",
    });

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/book-requests  — admin gets all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await BookRequest.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/book-requests/my  — customer gets their own requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BookRequest.find({ userId: req.user.id })
      .sort({
        createdAt: -1,
      })
      .lean();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/book-requests/:id  — admin approves or rejects
exports.updateRequest = async (req, res) => {
  try {
    const { status, price } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'approved' or 'rejected'." });
    }

    if (status === "approved") {
      const parsedPrice = Number(price);
      if (!price || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        return res
          .status(400)
          .json({ message: "A valid price is required when approving." });
      }

      const updated = await BookRequest.findByIdAndUpdate(
        req.params.id,
        {
          status: "approved",
          price: parsedPrice,
          adminMessage: "",
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Request not found." });
      }

      return res.status(200).json(updated);
    }

    // Rejection
    const updated = await BookRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        price: null,
        adminMessage: "Sorry, this book is not available.",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found." });
    }

    return res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
