const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const packagesModel = require("../../models/packagesModel");
const slugify = require("slugify");

exports.getPackageValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.createPackageValidator = [
  check("title")
    .notEmpty()
    .withMessage("Tray title is required")
    .isLength({ min: 4 })
    .withMessage("too short title")
    .custom(async (value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("description").notEmpty().withMessage("Description is required"),
  check("price").notEmpty().withMessage("Price is required"),
  check("discountedPrice")
    .optional()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("Discounted price must be lower than price");
      }
      return true;
    }),
  check("weight").notEmpty().withMessage("weight options are required"),
  validatorMiddleware,
];

exports.deletePackageValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
