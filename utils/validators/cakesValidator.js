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
      let cake = await cakeModel.find({ title: value });
      if (cake.length > 0) {
        throw new Error(
          `title: ( ${value} ) already exists! Choose another title`
        );
      }
      req.body.slug = slugify(value);
      return true;
    }),
  check("description").notEmpty().withMessage("Description is required"),
  check("price").notEmpty().withMessage("Price is required"),
  check("discountedPrice")
    .optional()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("discounted Price must be lower than price");
      }
      return true;
    }),
  check("size").notEmpty().withMessage("size options are required"),
  check("category").notEmpty().withMessage("Category is required"),
  validatorMiddleware,
];

exports.deleteCakeValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
