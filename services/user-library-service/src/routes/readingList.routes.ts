import express, { Request, Response } from "express";
import prisma from "../prisma.js";
import {
  createReadingListSchema,
  updateReadingListSchema,
  moveBooksSchema,
} from "../schemas.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { z } from "zod";

const router = express.Router();

// Get all reading lists for the authenticated user
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { includeBooks } = req.query;

    const lists = await prisma.readingList.findMany({
      where: { userId: req.userId! },
      orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      include: includeBooks === "true" ? {
        books: {
          orderBy: { sortOrder: "asc" },
          select: {
            bookId: true,
            addedAt: true,
            sortOrder: true,
          },
        },
      } : {
        books: {
          select: {
            bookId: true,
          },
        },
      },
    });

    const formattedLists = lists.map((list) => ({
      id: list.id,
      userId: list.userId,
      name: list.name,
      description: list.description,
      color: list.color,
      icon: list.icon,
      isPublic: list.isPublic,
      isDefault: list.isDefault,
      sortOrder: list.sortOrder,
      bookIds: list.books.map((b) => b.bookId),
      bookCount: list.books.length,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    }));

    res.json(formattedLists);
  } catch (error) {
    console.error("Error fetching reading lists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single reading list by ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeBooks } = req.query;

    const list = await prisma.readingList.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
      include: includeBooks === "true" ? {
        books: {
          orderBy: { sortOrder: "asc" },
          select: {
            bookId: true,
            addedAt: true,
            sortOrder: true,
          },
        },
      } : {
        books: {
          select: {
            bookId: true,
          },
        },
      },
    });

    if (!list) {
      return res.status(404).json({ error: "Reading list not found" });
    }

    const formattedList = {
      id: list.id,
      userId: list.userId,
      name: list.name,
      description: list.description,
      color: list.color,
      icon: list.icon,
      isPublic: list.isPublic,
      isDefault: list.isDefault,
      sortOrder: list.sortOrder,
      bookIds: list.books.map((b) => b.bookId),
      bookCount: list.books.length,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    };

    res.json(formattedList);
  } catch (error) {
    console.error("Error fetching reading list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new reading list
router.post(
  "/",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const parseResult = createReadingListSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.issues });
    }

    try {
      // Get current user's list count to set sort order
      const userListsCount = await prisma.readingList.count({
        where: { userId: req.userId! },
      });

      const list = await prisma.readingList.create({
        data: {
          userId: req.userId!,
          name: parseResult.data.name,
          description: parseResult.data.description,
          color: parseResult.data.color,
          icon: parseResult.data.icon,
          isPublic: parseResult.data.isPublic ?? false,
          sortOrder: userListsCount,
          books: {
            create: parseResult.data.bookIds?.map((bookId, index) => ({
              bookId,
              sortOrder: index,
            })) || [],
          },
        },
        include: {
          books: {
            select: {
              bookId: true,
            },
          },
        },
      });

      const formattedList = {
        id: list.id,
        userId: list.userId,
        name: list.name,
        description: list.description,
        color: list.color,
        icon: list.icon,
        isPublic: list.isPublic,
        isDefault: list.isDefault,
        sortOrder: list.sortOrder,
        bookIds: list.books.map((b) => b.bookId),
        bookCount: list.books.length,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
      };

      res.status(201).json(formattedList);
    } catch (error) {
      console.error("Error creating reading list:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update a reading list
router.put(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const parseResult = updateReadingListSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.issues });
    }

    try {
      // Verify ownership
      const existingList = await prisma.readingList.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!existingList) {
        return res.status(404).json({ error: "Reading list not found" });
      }

      // Prevent modification of default lists (except sortOrder)
      if (existingList.isDefault && parseResult.data.name !== undefined) {
        return res
          .status(400)
          .json({ error: "Cannot modify name of default reading lists" });
      }

      const updateData: any = {};
      if (parseResult.data.name !== undefined) updateData.name = parseResult.data.name;
      if (parseResult.data.description !== undefined)
        updateData.description = parseResult.data.description;
      if (parseResult.data.color !== undefined) updateData.color = parseResult.data.color;
      if (parseResult.data.icon !== undefined) updateData.icon = parseResult.data.icon;
      if (parseResult.data.isPublic !== undefined)
        updateData.isPublic = parseResult.data.isPublic;
      if (parseResult.data.sortOrder !== undefined)
        updateData.sortOrder = parseResult.data.sortOrder;

      const list = await prisma.readingList.update({
        where: { id },
        data: updateData,
        include: {
          books: {
            select: {
              bookId: true,
            },
          },
        },
      });

      const formattedList = {
        id: list.id,
        userId: list.userId,
        name: list.name,
        description: list.description,
        color: list.color,
        icon: list.icon,
        isPublic: list.isPublic,
        isDefault: list.isDefault,
        sortOrder: list.sortOrder,
        bookIds: list.books.map((b) => b.bookId),
        bookCount: list.books.length,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
      };

      res.json(formattedList);
    } catch (error) {
      console.error("Error updating reading list:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete a reading list
router.delete("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingList = await prisma.readingList.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (!existingList) {
      return res.status(404).json({ error: "Reading list not found" });
    }

    if (existingList.isDefault) {
      return res
        .status(400)
        .json({ error: "Cannot delete default reading lists" });
    }

    await prisma.readingList.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting reading list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Move books between reading lists
router.post(
  "/:id/move-books",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const parseResult = moveBooksSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.issues });
    }

    try {
      // Verify source list ownership
      const sourceList = await prisma.readingList.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!sourceList) {
        return res.status(404).json({ error: "Source reading list not found" });
      }

      // Verify target list ownership
      const targetList = await prisma.readingList.findFirst({
        where: {
          id: parseResult.data.targetListId,
          userId: req.userId!,
        },
      });

      if (!targetList) {
        return res.status(404).json({ error: "Target reading list not found" });
      }

      // Remove books from source list
      await prisma.readingListBook.deleteMany({
        where: {
          readingListId: id,
          bookId: {
            in: parseResult.data.bookIds,
          },
        },
      });

      // Add books to target list (skip if already exists)
      const existingBooks = await prisma.readingListBook.findMany({
        where: {
          readingListId: parseResult.data.targetListId,
          bookId: {
            in: parseResult.data.bookIds,
          },
        },
        select: { bookId: true },
      });

      const existingBookIds = new Set(existingBooks.map((b) => b.bookId));
      const newBookIds = parseResult.data.bookIds.filter(
        (id) => !existingBookIds.has(id)
      );

      if (newBookIds.length > 0) {
        const currentMaxSort = await prisma.readingListBook.findFirst({
          where: { readingListId: parseResult.data.targetListId },
          orderBy: { sortOrder: "desc" },
          select: { sortOrder: true },
        });

        const maxSort = currentMaxSort?.sortOrder ?? -1;

        await prisma.readingListBook.createMany({
          data: newBookIds.map((bookId, index) => ({
            readingListId: parseResult.data.targetListId,
            bookId,
            sortOrder: maxSort + 1 + index,
          })),
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error moving books:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Add books to a reading list
router.post(
  "/:id/books",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const bookIdsSchema = z.object({
      bookIds: z.array(z.string()).min(1),
    });

    const parseResult = bookIdsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.issues });
    }

    try {
      const list = await prisma.readingList.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!list) {
        return res.status(404).json({ error: "Reading list not found" });
      }

      // Get existing books to avoid duplicates
      const existingBooks = await prisma.readingListBook.findMany({
        where: {
          readingListId: id,
          bookId: {
            in: parseResult.data.bookIds,
          },
        },
        select: { bookId: true },
      });

      const existingBookIds = new Set(existingBooks.map((b) => b.bookId));
      const newBookIds = parseResult.data.bookIds.filter(
        (bookId) => !existingBookIds.has(bookId)
      );

      if (newBookIds.length > 0) {
        const currentMaxSort = await prisma.readingListBook.findFirst({
          where: { readingListId: id },
          orderBy: { sortOrder: "desc" },
          select: { sortOrder: true },
        });

        const maxSort = currentMaxSort?.sortOrder ?? -1;

        await prisma.readingListBook.createMany({
          data: newBookIds.map((bookId, index) => ({
            readingListId: id,
            bookId,
            sortOrder: maxSort + 1 + index,
          })),
        });
      }

      // Return updated list
      const updatedList = await prisma.readingList.findUnique({
        where: { id },
        include: {
          books: {
            select: {
              bookId: true,
            },
          },
        },
      });

      const formattedList = {
        id: updatedList!.id,
        userId: updatedList!.userId,
        name: updatedList!.name,
        description: updatedList!.description,
        color: updatedList!.color,
        icon: updatedList!.icon,
        isPublic: updatedList!.isPublic,
        isDefault: updatedList!.isDefault,
        sortOrder: updatedList!.sortOrder,
        bookIds: updatedList!.books.map((b) => b.bookId),
        bookCount: updatedList!.books.length,
        createdAt: updatedList!.createdAt.toISOString(),
        updatedAt: updatedList!.updatedAt.toISOString(),
      };

      res.status(200).json(formattedList);
    } catch (error) {
      console.error("Error adding books to reading list:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Remove books from a reading list
router.delete(
  "/:id/books",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const bookIdsSchema = z.object({
      bookIds: z.array(z.string()).min(1),
    });

    const parseResult = bookIdsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.issues });
    }

    try {
      const list = await prisma.readingList.findFirst({
        where: {
          id,
          userId: req.userId!,
        },
      });

      if (!list) {
        return res.status(404).json({ error: "Reading list not found" });
      }

      await prisma.readingListBook.deleteMany({
        where: {
          readingListId: id,
          bookId: {
            in: parseResult.data.bookIds,
          },
        },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error removing books from reading list:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Initialize default reading lists for a new user
router.post(
  "/initialize-defaults",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;

      // Check if user already has default lists
      const existingDefaults = await prisma.readingList.findMany({
        where: {
          userId,
          isDefault: true,
        },
      });

      if (existingDefaults.length > 0) {
        return res.status(200).json({
          message: "Default lists already exist",
          lists: existingDefaults.map((list) => ({
            id: list.id,
            name: list.name,
          })),
        });
      }

      // Create three default lists
      const defaultLists = [
        {
          name: "Currently Reading",
          description: "Books I'm currently reading",
          color: "#3B82F6",
          icon: "📖",
          isDefault: true,
          isPublic: false,
          sortOrder: 0,
        },
        {
          name: "Want to Read",
          description: "Books I want to read in the future",
          color: "#10B981",
          icon: "📚",
          isDefault: true,
          isPublic: false,
          sortOrder: 1,
        },
        {
          name: "Finished",
          description: "Books I've finished reading",
          color: "#8B5CF6",
          icon: "✅",
          isDefault: true,
          isPublic: false,
          sortOrder: 2,
        },
      ];

      const createdLists = await Promise.all(
        defaultLists.map((listData) =>
          prisma.readingList.create({
            data: {
              userId,
              ...listData,
            },
            include: {
              books: {
                select: {
                  bookId: true,
                },
              },
            },
          })
        )
      );

      const formattedLists = createdLists.map((list) => ({
        id: list.id,
        userId: list.userId,
        name: list.name,
        description: list.description,
        color: list.color,
        icon: list.icon,
        isPublic: list.isPublic,
        isDefault: list.isDefault,
        sortOrder: list.sortOrder,
        bookIds: list.books.map((b) => b.bookId),
        bookCount: list.books.length,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
      }));

      res.status(201).json({
        message: "Default reading lists created",
        lists: formattedLists,
      });
    } catch (error) {
      console.error("Error initializing default lists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;

