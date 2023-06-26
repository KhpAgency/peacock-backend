const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./controllersFactory");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // get cart depends on cartId
  const cart = await cartModel.findById(req.params.cartId);

  if (!cart) {
    return next(
      new ApiError(`No cart found for this id:${req.params.cartId}`, 404)
    );
  }

  // set order price depend on cart total price
  const cartPrice = cart.totalCartPrice;
  const totalorderPrice = cartPrice;

  // create order with default cash on delivery payment method
  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalorderPrice,
    shippingAddressDetails: req.body.shippingAddressDetails,
  });

  if (order) {
    // clear cart depending on cartId
    await cartModel.findByIdAndDelete(req.params.cartId);
  }

  res.status(200).json({ status: "success", order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req,res,next) => {
    if (req.user.role === "user") req.filterObj = {user: req.user._id}
    next();
})

exports.findAllOrders = factory.getAll(orderModel)

exports.findSpecificOrder = factory.getOne(orderModel)