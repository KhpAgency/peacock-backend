const express = require("express");

const {
  getTrays,
  getTray,
  createTray,
  deleteTray,
  uploadTraysImages,
  resizeTraysImages,
} = require("../controllers/traysController");

const {
  getTrayValidator,
  createTrayValidator,
  deleteTrayValidator,
} = require("../utils/validators/traysValidator");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");


Router.route("/")
  .get(getTrays)
  .post(protect,
    allowedTo("admin", "manager"),uploadTraysImages, resizeTraysImages, createTrayValidator, createTray);
Router.route("/:id")
  .get(getTrayValidator, getTray)
  .delete(protect,
    allowedTo("admin"),deleteTrayValidator, deleteTray);

module.exports = Router;
