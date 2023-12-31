import { SortOrder } from "mongoose";
import { calculate_pagination } from "../../../helpers/pagination_helpers";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { books_searchable_fields } from "./book.constant";
import { IBook, IBookFilterableFields, IBookReview } from "./book.interface";
import { Book } from "./book.model";

const getBooks = async (
  { searchTerm, ...filters_data }: IBookFilterableFields,
  pagination_options: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const and_conditions = [];

  if (searchTerm) {
    and_conditions.push({
      $or: books_searchable_fields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filters_data).length) {
    and_conditions.push({
      $and: Object.entries(filters_data).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    calculate_pagination(pagination_options);

  const sort_conditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) sort_conditions[sortBy] = sortOrder;

  const where_condition =
    and_conditions.length > 0 ? { $and: and_conditions } : {};

  const result = await Book.find(where_condition)
    .sort(sort_conditions)
    .skip(skip)
    .limit(limit);

  const total = await Book.countDocuments(where_condition);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getBook = async (id: string): Promise<IBook | null> => {
  const result = await Book.findById(id);

  return result;
};

const createBook = async (payload: IBook): Promise<IBook> => {
  const result = await Book.create(payload);

  return result;
};

const updateBook = async (
  id: string,
  payload: Partial<IBook>
): Promise<IBook | null> => {
  const result = await Book.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deleteBook = async (id: string, book: IBook): Promise<IBook | null> => {
  const result = await Book.findByIdAndDelete(id);

  return result;
};

const addReview = async (id: string, payload: IBookReview) => {
  const result = await Book.findOneAndUpdate(
    { _id: id },
    { $push: { reviews: payload } },
    { new: true }
  );

  return result;
};

const addToWishlist = async (id: string, payload: any) => {
  const result = await Book.findOneAndUpdate(
    { _id: id },
    { wishlist: payload },
    {
      new: true,
    }
  );
  return result;
};

const removeFromWishlist = async (id: string, email: string) => {
  const result = await Book.findOneAndUpdate(
    { _id: id },
    {
      $pull: {
        wishlist: email,
        read_soon: email,
        currently_reading: email,
        finished: email,
      },
    },
    {
      new: true,
    }
  );

  return result;
};

const addToReadSoon = async (id: string, payload: string[]) => {
  const email: string = payload[payload.length - 1];

  const result = await Book.findOneAndUpdate(
    { _id: id },
    {
      $pull: { currently_reading: email, finished: email },
      $addToSet: { read_soon: payload },
    },
    {
      new: true,
    }
  );

  return result;
};

const addToCurrentlyReading = async (id: string, payload: string[]) => {
  const email: string = payload[payload.length - 1];

  const result = await Book.findOneAndUpdate(
    { _id: id },
    {
      $pull: { read_soon: email, finished: email },
      $addToSet: {
        currently_reading: payload,
      },
    },
    {
      new: true,
    }
  );
  return result;
};

const addToFinished = async (id: string, payload: string[]) => {
  const email: string = payload[payload.length - 1];

  const result = await Book.findOneAndUpdate(
    { _id: id },
    {
      $pull: { read_soon: email, currently_reading: email },
      $addToSet: { finished: payload },
    },
    {
      new: true,
    }
  );

  return result;
};

export const BookService = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  addReview,
  addToWishlist,
  removeFromWishlist,
  addToReadSoon,
  addToCurrentlyReading,
  addToFinished,
};
