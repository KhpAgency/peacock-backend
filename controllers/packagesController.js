const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const packagesModel = require("../models/packagesModel");
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

exports.uploadPackagesImages = upload.array("images", 4);

exports.resizePackagesImages = asyncHandler(async (req, res, next) => {
  if (req.files) {
    req.body.images = [];
    await Promise.all(
      req.files.map(async (img, index) => {
        const imageName = `packages-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/packages/${imageName}`);

        req.body.images.push(imageName);
      })
    );
    next();
  }
});

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
