const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const trayModel = require("../../models/trayModel");
const slugify = require("slugify");

exports.getTrayValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.createTrayValidator = [
  check("title")
    .notEmpty()
    .withMessage("Tray title is required")
    .isLength({ min: 4 })
    .withMessage("too short title")
    .custom((value, { req }) => {
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

exports.deleteTrayValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
