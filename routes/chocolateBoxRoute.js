const express = require("express");

const {
  getChocolateBoxs,
  getChocolateBox,
  createChocolateBox,
  deleteChocolateBox,
} = require("../controllers/chocolateBoxController");

const {
  getChocolateBoxValidator,
  createChocolateBoxValidator,
  deleteChocolateBoxValidator,
} = require("../utils/validators/chocolateBoxValidator");

const Router = express.Router();

Router.route("/")
  .get(getChocolateBoxs)
  .post(createChocolateBoxValidator, createChocolateBox);
Router.route("/:id")
  .get(getChocolateBoxValidator, getChocolateBox)
  .delete(deleteChocolateBoxValidator, deleteChocolateBox);
module.exports = Router;
