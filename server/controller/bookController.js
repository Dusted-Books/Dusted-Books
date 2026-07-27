const cloudinary = require("../config/cloudinary");
const Book = require("../model/book");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.BookUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, author, description, price, category, condition } = req.body;
    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice)) {
      return res.status(400).json({ error: "Price must be a number" });
    }
    const categories = Array.isArray(category)
      ? category
      : category
        ? [category]
        : [];

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "Book_Images",
        transformation: [
          { width: 300, height: 400, crop: "limit" },
          { quality: "auto" },
        ],
      }
      ,
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error });
        }
        try {
          const newBook = await Book.create({
            title,
            author,
            description,
            price: parsedPrice,
            category: categories,
            condition,
            imgUrl: result.secure_url,
          });
          res.status(201).json(newBook);
        } catch (dbErr) {
          res.status(500).json({ error: dbErr.message });
        }

      },
    );
    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
