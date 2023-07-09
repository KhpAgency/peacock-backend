const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./controllersFactory");

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
        let imageName;
        if (img.mimetype === "image/heic") {
          const heicBuffer = img.buffer;
          const jpegBuffer = await heicConvert({
            buffer: heicBuffer,
            format: "JPEG",
          });
          imageName = `cake-${img.originalname}-${uuidv4()}-${Date.now()}-${
            index + 1
          }.jpeg`;
          await sharp(jpegBuffer)
            .jpeg({ quality: 90 })
            .toFile(`uploads/cakes/${imageName}`);
        } else {
          imageName = `cake-${img.originalname}-${uuidv4()}-${Date.now()}-${
            index + 1
          }.jpeg`;
          await sharp(img.buffer)
            .jpeg({ quality: 90 })
            .toFile(`uploads/cakes/${imageName}`);
        }

        req.body.images.push(imageName);
      })
    );
    next();
  }
});

exports.getCakes = factory.getAll(cakesModel);

exports.getCake = factory.getOne(cakesModel);

exports.createCake = factory.createOne(cakesModel);

exports.deleteCake = factory.deleteOne(cakesModel);
