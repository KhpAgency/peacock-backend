const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const packagesModel = require("../../models/packagesModel");

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

    .custom(async (value) => {
      let box = await packagesModel.find({ title: value });
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
  check("weight").notEmpty().withMessage("weight options are required"),
  validatorMiddleware,
];

exports.deletePackageValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
