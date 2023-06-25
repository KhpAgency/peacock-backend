const express = require("express");

const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
} = require("../controllers/cartController");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");

Router.use(protect, allowedTo("user"));
Router.route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);
Router.route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

module.exports = Router;
