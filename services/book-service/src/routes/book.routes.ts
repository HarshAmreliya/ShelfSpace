import express from "express";
import prisma from "../prisma.ts";
import type { CreateBookInput } from "../schemas.ts";
import { createBookSchema, getAllBooksQueryParamsSchema } from "../schemas.ts";
import z from "zod";
import axios from "axios";

const router = express.Router();

//GET /api/books -Get many books
router.get("/books");

export default router;
