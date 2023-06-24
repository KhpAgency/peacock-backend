const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const cartModel = require("../models/cartModel");
const { json } = require("express");

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  // Get cart for logged in user
  let cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    // create a new cart for the logged in user
    const { productCategory, productID, variant, price } = req.body;
    cart = await cartModel.create({
      user: req.user._id,
      cartItems: [{ productCategory, productID, variant, price }],
    });
    res.json({message: 'Cart created successfully', cart: cart});
  } else {
    console.log('there is cart already');
  }
});
