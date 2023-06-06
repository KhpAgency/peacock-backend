const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const packagesModel = require("../models/packagesModel");

exports.getPackages = asyncHandler(async (req, res, next) => {
  const Packages = await packagesModel.find({});
  res.status(200).json({ results: Packages.length, data: Packages });
});

exports.getPackage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const Package = await packagesModel.findById(id);
  if (!Package) {
    return next(new ApiError(`No Package for this id:${id}`, 404));
  }
  res.status(200).json({ data: Package });
});

exports.createPackage = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);
  const Package = await packagesModel.create(req.body);
  res.status(201).json({ message: "Success", data: Package });
});

exports.deletePackage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Package = await packagesModel.findByIdAndDelete(id);
  if (!Package) {
    return next(new ApiError(`No Package found for this id:${id}`, 404));
  }
  res.status(204).send("Package deleted successfully");
});
