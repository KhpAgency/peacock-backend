const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.createCategoryvalidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 4 })
    .withMessage("too short category name"),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
    check("id").isMongoId().withMessage("Invalid category id format"),
    validatorMiddleware,
  ];
