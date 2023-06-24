const express = require("express");

const { addProductToCart } = require("../controllers/cartController");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");

Router.route("/").post(protect, allowedTo("user"), addProductToCart);

module.exports = Router;
