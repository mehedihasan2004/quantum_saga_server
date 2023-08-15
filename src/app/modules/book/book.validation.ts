import { z } from "zod";
import { book_genres } from "./book.constant";

const createBookZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required !!" }),
    author: z.string({ required_error: "Authore is required !!" }),
    genre: z.enum([...book_genres] as [string, ...string[]]),
    publication_date: z.string({ required_error: "Date is required !!" }),
    reviews: z.array(
      z.object({
        email: z.string({ required_error: "Email is required !!" }).email(),
        comment: z.string({ required_error: "Comment is required !!" }),
      })
    ),
  }),
});

const updateBookZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    genre: z.enum([...book_genres] as [string, ...string[]]).optional(),
    publication_date: z.string().optional(),
    reviews: z
      .array(
        z.object({
          email: z.string().email().optional(),
          comment: z.string().optional(),
        })
      )
      .optional(),
  }),
});

export const BookValidation = { createBookZodSchema, updateBookZodSchema };
