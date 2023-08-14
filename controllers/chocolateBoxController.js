const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const heicConvert = require("heic-convert");
const factory = require("./controllersFactory");

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
        console.log(img);
        let imageName;
        if (img.mimetype === "image/heic") {
          const heicBuffer = img.buffer;
          const jpegBuffer = await heicConvert({
            buffer: heicBuffer,
            format: "JPEG",
          });
          imageName = `chocolateBox-${
            img.originalname.split(" ").join("")
          }-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
          await sharp(jpegBuffer)
            .jpeg({ quality: 90 })
            .toFile(`uploads/chocolateBox/${imageName}`);
        } else {
          imageName = `chocolateBox-${
            img.originalname.split(" ").join("")
          }-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
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

exports.getChocolateBoxs = factory.getAll(ChocolateBoxModel);

exports.createChocolateBox = factory.createOne(ChocolateBoxModel);

exports.getChocolateBox = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await ChocolateBoxModel.findById(id).populate("categoryId");
  if (!document) {
    return next(new ApiError(`No document found for this id:${id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.deleteChocolateBox = factory.deleteOne(ChocolateBoxModel);
