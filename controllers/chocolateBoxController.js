const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const heicConvert = require('heic-convert');

const ChocolateBoxModel = require("../models/chocolateBoxesModel");

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

exports.uploadChocolateBoxImages = upload.array("images", 4);

exports.resizeChocolateBoxImages = asyncHandler(async (req, res, next) => {
  if (req.files) {
    req.body.images = [];
    await Promise.all(
      req.files.map(async (img, index) => {
        let imageName;
        if (img.mimetype === "image/heic") {
          const heicBuffer = img.buffer;
          const jpegBuffer = await heicConvert({
            buffer: heicBuffer,
            format: "JPEG",
          });
          imageName = `chocolateBox-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
          await sharp(jpegBuffer)
            .jpeg({ quality: 90 })
            .toFile(`uploads/chocolateBox/${imageName}`);
        } else {
          imageName = `chocolateBox-${uuidv4()}-${Date.now()}-${index + 1}${img.originalname}`;
          await sharp(img.buffer)
            .jpeg({ quality: 90 })
            .toFile(`uploads/chocolateBox/${imageName}`);
        }
        req.body.images.push(imageName);
      })
    );
    next();
  }
});

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
