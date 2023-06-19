const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const categoriesModel = require("../../models/categoriesModel");
const slugify = require("slugify");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.createCategoryvalidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 4 })
    .withMessage("too short category name")
    .custom(async (value, {req}) => {
      let category = await categoriesModel.find({ name: value });
      if (category.length > 0) {
        throw new Error(
          `Category name: ( ${value} ) already exists! Choose another name!`
        );
      }
      req.body.slug = slugify(value);
    }),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
