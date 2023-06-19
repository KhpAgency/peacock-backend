const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./controllersFactory");

const CategoryModel = require("../models/categoriesModel");

exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await CategoryModel.find({});
  res.status(200).json({ results: categories.length, data: categories });
});

exports.getCategory = factory.getOne(CategoryModel)

exports.createCategory = factory.createOne(CategoryModel)

exports.deleteCategory = factory.deleteOne(CategoryModel)
