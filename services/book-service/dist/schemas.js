import { z } from "zod";
export const bookSchema = z.object({
    series: z.array(z.string()).optional(),
    language_code: z.string().optional(),
    average_rating: z.number().optional(),
    similar_books: z.array(z.string()).optional(),
    description: z.string().optional(),
    authors: z
        .array(z.object({
        author_id: z.string(),
        name: z.string(),
        role: z.string(),
    }))
        .optional(),
    publisher: z.string().optional(),
    num_pages: z.number().optional(),
    isbn13: z.string().optional(),
    publication_year: z.string().optional(),
    url: z.string().optional(),
    image_url: z.string().optional(),
    book_id: z.string(),
    work_id: z.string().optional(),
    title: z.string(),
    title_without_series: z.string().optional(),
    genres: z.array(z.string()).optional(),
});
const pageSchema = z
    .string()
    .regex(/^\d+$/, { message: "Page must be a positive integer" })
    .refine((val) => parseInt(val, 10) >= 1, {
    message: "Page must be at least 1",
});
const limitSchema = z
    .string()
    .regex(/^\d+$/, { message: "Limit must be a positive integer" })
    .refine((val) => {
    const n = parseInt(val, 10);
    return n >= 1 && n <= 100;
}, {
    message: "Limit must be between 1 and 100",
});
const createBookBodySchema = bookSchema.extend({
    book_id: z.string().optional(),
});
export const createBookSchema = z.object({
    body: createBookBodySchema,
});
export const updateBookSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: bookSchema.partial(),
});
export const getBookByIdSchema = z.object({
    params: z.object({
        bookId: z.string(),
    }),
});
export const deleteBookSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});
export const searchBookSchema = z.object({
    query: z.object({
        q: z.string().min(1, "Search query is required"),
        page: pageSchema.optional(),
        limit: limitSchema.optional(),
    }),
});
export const getBooksSchema = z.object({
    query: z.object({
        page: pageSchema.optional(),
        limit: limitSchema.optional(),
        author: z.string().optional(),
        genre: z.string().optional(),
        sortBy: z.enum(["asc", "desc"]).optional(),
        search: z.string().optional(),
    }),
});
export const getBooksByRatingSchema = z.object({
    params: z.object({
        rating: z.string().refine((val) => !isNaN(parseFloat(val)), {
            message: "Rating must be a number",
        }),
    }),
});
export const getBooksByGenreSchema = z.object({
    params: z.object({
        genre: z.string(),
    }),
});
export const getBooksByAuthorSchema = z.object({
    params: z.object({
        author: z.string(),
    }),
});
