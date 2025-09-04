import Book from "../models/book";

// @desc    Create a new book
// @route   POST /api/books
const createBook = async (req: Request, res: Response) => {
  try {
    const bookData = req.body;
    // Basic validation
    if (!bookData.title || !bookData.authors) {
      return res
        .status(400)
        .json({ message: "Missing required fields: title, authors, isbn13" });
    }
    const newBook = new Book(bookData);
    await newBook.save();
    res.status(201).json({ message: "Book added successfully", book: newBook });
  } catch (error) {
    // Handle potential duplicate key errors (e.g., for isbn13)
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Error: A book with this ISBN or Book ID already exists.",
        details: error.keyValue,
      });
    }
    res
      .status(500)
      .json({ message: "Error creating book", error: error.message });
  }
};

// @desc    Get all books with pagination
// @route   GET /api/books
const getAllBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const books = await Book.find().skip(skip).limit(pageSize);
    const totalBooks = await Book.countDocuments();

    res.status(200).json({
      message: "Books retrieved successfully",
      data: books,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil(totalBooks / pageSize),
        totalBooks: totalBooks,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
};

// @desc    Get a single book by its ID
// @route   GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching book", error: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res
      .status(200)
      .json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating book", error: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting book", error: error.message });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
