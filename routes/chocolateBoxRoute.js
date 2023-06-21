const express = require("express");

const {
  getChocolateBoxs,
  getChocolateBox,
  createChocolateBox,
  deleteChocolateBox,
  uploadChocolateBoxImages,
  resizeChocolateBoxImages,
} = require("../controllers/chocolateBoxController");

const {
  getChocolateBoxValidator,
  createChocolateBoxValidator,
  deleteChocolateBoxValidator,
} = require("../utils/validators/chocolateBoxValidator");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");


Router.route("/")
  .get(getChocolateBoxs)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadChocolateBoxImages,
    resizeChocolateBoxImages,
    createChocolateBoxValidator,
    createChocolateBox
  );
Router.route("/:id")
  .get(getChocolateBoxValidator, getChocolateBox)
  .delete(
    protect,
    allowedTo("admin"),
    deleteChocolateBoxValidator,
    deleteChocolateBox
  );
module.exports = Router;
