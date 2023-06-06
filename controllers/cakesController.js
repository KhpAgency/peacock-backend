const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const cakesModel = require("../models/cakeModel");

exports.getCakes = asyncHandler(async (req, res, next) => {
  const Cakes = await cakesModel.find({});
  res.status(200).json({ results: Cakes.length, data: Cakes });
});

exports.getCake = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const Cake = await cakesModel.findById(id);
  if (!Cake) {
    return next(new ApiError(`No Cake for this id:${id}`, 404));
  }
  res.status(200).json({ data: Cake });
});

exports.createCake = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);
  const Cake = await cakesModel.create(req.body);
  res.status(201).json({ message: "Success", data: Cake });
});

exports.deleteCake = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Cake = await cakesModel.findByIdAndDelete(id);
  if (!Cake) {
    return next(new ApiError(`No Cake found for this id:${id}`, 404));
  }
  res.status(204).send("Cake deleted successfully");
});
