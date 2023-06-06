const express = require("express");

const {
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const {
  getCategoryValidator,
  createCategoryvalidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");

const Router = express.Router();

Router.route("/")
  .get(getCategories)
  .post(createCategoryvalidator, createCategory);
Router.route("/:id")
  .get(getCategoryValidator, getCategory)
  .delete(deleteCategoryValidator, deleteCategory);
module.exports = Router;
