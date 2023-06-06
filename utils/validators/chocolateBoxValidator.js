const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const chocolateBoxModel = require("../../models/chocolateBoxesModel");

exports.getChocolateBoxValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.createChocolateBoxValidator = [
  check("title")
    .notEmpty()
    .withMessage("Chocolate Box title is required")
    .isLength({ min: 4 })
    .withMessage("too short title")

    .custom(async (value) => {
      let box = await chocolateBoxModel.find({ title: value });
      if (box.length > 0) {
        throw new Error(
          `title: ( ${value} ) already exists! Choose another title`
        );
      }
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
  check("pieces").notEmpty().withMessage("pieces options is required"),
  validatorMiddleware,
];

exports.deleteChocolateBoxValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
