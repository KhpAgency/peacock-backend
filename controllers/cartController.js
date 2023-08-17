const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const cartModel = require("../models/cartModel");

const calcTotalCartPrice = (cart) => {
  //   calculate total cart price
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  return totalPrice;
};

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
  } else {
    // product already exists in the cart => update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) =>
        item.productID.toString() === req.body.productID &&
        item.variant == req.body.variant
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // push product to cartItems array
      const { productCategory, productID, variant, price } = req.body;
      cart.cartItems.push({ productCategory, productID, variant, price });
    }
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product added successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  let cart = await cartModel
    .findOne({ user: req.user._id })
    .populate({ path: "user", select: "_id name email phone addresses" });

  // Populate the productID field
  const populatedOrder = await cartModel.populate(cart, {
    path: "cartItems.productID",
  });

  if (!cart) {
    return next(new ApiError("No cart for this user", 404));
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  let cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  calcTotalCartPrice(cart);
  cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  await cartModel.findOneAndDelete({ user: req.user._id });
  res.status(200).json({ message: "cart deleted" });
});

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("No cart fount forthis user"), 404);
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`No item found for this id: ${req.params.itemId}`, 404)
    );
  }

  calcTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
