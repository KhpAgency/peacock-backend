const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const trayModel = require("../../models/trayModel");

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

    .custom(async (value) => {
      let box = await trayModel.find({ title: value });
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

exports.deleteTrayValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
