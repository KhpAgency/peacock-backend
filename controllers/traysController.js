const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const TraysModel = require("../models/trayModel");

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

exports.uploadTraysImages = upload.array("images", 4);

exports.resizeTraysImages = asyncHandler(async (req, res, next) => {
  if (req.files) {
    req.body.images = [];
    await Promise.all(
      req.files.map(async (img, index) => {
        const imageName = `tray-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/trays/${imageName}`);

        req.body.images.push(imageName);
      })
    );
    next();
  }
});

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
