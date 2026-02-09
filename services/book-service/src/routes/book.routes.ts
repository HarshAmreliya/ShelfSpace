import { Router } from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
  getGenres,
  getAuthors,
  getLanguages,
} from "../controllers/book.controller.js";
import validate from "../middlewares/validate.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  createBookSchema,
  updateBookSchema,
  getBookByIdSchema,
  deleteBookSchema,
  searchBookSchema,
  getBooksSchema,
} from "../schemas.js";

const router = Router();

router.post("/", authenticateToken, validate(createBookSchema), createBook);
router.get("/search", validate(searchBookSchema), searchBooks);
router.get("/genres", getGenres);
router.get("/authors", getAuthors);
router.get("/languages", getLanguages);

router.get("/", validate(getBooksSchema), getAllBooks);
router.get("/:bookId", validate(getBookByIdSchema), getBookById);
router.put("/:id", authenticateToken, validate(updateBookSchema), updateBook);
router.delete("/:id", authenticateToken, validate(deleteBookSchema), deleteBook);

export default router;
