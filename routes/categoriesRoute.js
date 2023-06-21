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

const { protect, allowedTo } = require("../controllers/authController");
const Router = express.Router();

Router.route("/")
  .get(getCategories)
  .post(
    protect,
    allowedTo("admin", "manager"),
    createCategoryvalidator,
    createCategory
  );
Router.route("/:id")
  .get(getCategoryValidator, getCategory)
  .delete(
    protect,
    allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );
module.exports = Router;
