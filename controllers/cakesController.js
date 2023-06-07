const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const cakesModel = require("../models/cakeModel");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();

const multerfilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("only Images allowed", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerfilter });

exports.uploadCakesImages = upload.array("images", 4);

exports.resizeCakesImages = asyncHandler(async (req, res, next) => {
  if (req.files) {
    req.body.images = [];
    await Promise.all(
      req.files.map(async (img, index) => {
        const imageName = `cake-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/cakes/${imageName}`);

        req.body.images.push(imageName);
      })
    );
    next();
  }
});

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
