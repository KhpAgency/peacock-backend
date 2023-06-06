const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const TraysModel = require("../models/trayModel");

exports.getTrays = asyncHandler(async (req, res, next) => {
  const Trays = await TraysModel.find({});
  res.status(200).json({ results: Trays.length, data: Trays });
});

exports.getTray = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const Tray = await TraysModel.findById(id);
  if (!Tray) {
    return next(new ApiError(`No Tray found for this id:${id}`, 404));
  }
  res.status(200).json({ data: Tray });
});

exports.createTray = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);
  const Tray = await TraysModel.create(req.body);
  res.status(201).json({ message: "Success", data: Tray });
});

exports.deleteTray = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Tray = await TraysModel.findByIdAndDelete(id);
  if (!Tray) {
    return next(new ApiError(`No Tray box found for this id:${id}`, 404));
  }
  res.status(204).send("Tray box deleted successfully");
});
