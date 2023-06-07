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

Router.route("/")
  .get(getChocolateBoxs)
  .post(
    uploadChocolateBoxImages,
    resizeChocolateBoxImages,
    createChocolateBoxValidator,
    createChocolateBox
  );
Router.route("/:id")
  .get(getChocolateBoxValidator, getChocolateBox)
  .delete(deleteChocolateBoxValidator, deleteChocolateBox);
module.exports = Router;
