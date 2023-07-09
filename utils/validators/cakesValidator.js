const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const cakeModel = require("../../models/cakeModel");
const slugify = require("slugify");

exports.getCakeValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.createCakeValidator = [
  check("title")
    .notEmpty()
    .withMessage("Cake title is required")
    .isLength({ min: 4 })
    .withMessage("too short title")
    .custom(async (value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    })
    ,
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
  check("size").notEmpty().withMessage("size options are required"),
  validatorMiddleware,
];

exports.deleteCakeValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
