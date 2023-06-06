const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const ChocolateBoxModel = require("../models/chocolateBoxesModel");

exports.getChocolateBoxs = asyncHandler(async (req, res, next) => {
  const chocolateBoxs = await ChocolateBoxModel.find({});
  res.status(200).json({ results: chocolateBoxs.length, data: chocolateBoxs });
});

exports.getChocolateBox = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const chocolateBox = await ChocolateBoxModel.findById(id);
  if (!chocolateBox) {
    return next(new ApiError(`No chocolateBox found for this id:${id}`, 404));
  }
  res.status(200).json({ data: chocolateBox });
});

exports.createChocolateBox = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);
  const chocolateBox = await ChocolateBoxModel.create(req.body);
  res.status(201).json({ message: "Success", data: chocolateBox });
});

exports.deleteChocolateBox = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const chocolateBox = await ChocolateBoxModel.findByIdAndDelete(id);
  if (!chocolateBox) {
    return next(new ApiError(`No Chocolate box found for this id:${id}`, 404));
  }
  res.status(204).send("chocolate box deleted successfully");
});
