const express = require("express");
const multer = require("multer");

const {
  getCakes,
  getCake,
  createCake,
  deleteCake,
  uploadCakesImages,
  resizeCakesImages,
} = require("../controllers/cakesController");

const {
  getCakeValidator,
  createCakeValidator,
  deleteCakeValidator,
} = require("../utils/validators/cakesValidator");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");

Router.route("/")
  .get(getCakes)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadCakesImages,
    resizeCakesImages,
    createCakeValidator,
    createCake
  );
Router.route("/:id")
  .get(getCakeValidator, getCake)
  .delete(
    protect,
    allowedTo("admin"),
    deleteCakeValidator,
    deleteCake
  );

module.exports = Router;
