const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./controllersFactory");
const paytabs = require("paytabs_pt2");

const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
// const axios = require("axios");

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
    orderNumber: `SA-4000${Math.floor(Math.random() * 1000000000)}`,
    cartItems: cart.cartItems,
    totalorderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  if (order) {
    // clear cart depending on cartId
    await cartModel.findByIdAndDelete(req.params.cartId);
  }

  res.status(200).json({ status: "success", order });
});

exports.createOnlinePaymentOrder = asyncHandler(async (req, res, next) => {
  let profileID = process.env.profileID,
    serverKey = process.env.serverKey,
    region = process.env.region;

  paytabs.setConfig(profileID, serverKey, region);

  let paymentMethods = ["all"];

  let transaction = {
    type: "sale",
    class: "ecom",
  };

  let transaction_details = [transaction.type, transaction.class];

  // get cart depends on cartId
  const cart = await cartModel.findById(req.params.cartId);

  if (!cart) {
    return next(
      new ApiError(`No cart found for this id:${req.params.cartId}`, 400)
    );
  }

  // set order price depend on cart total price
  const cartPrice = cart.totalCartPrice;
  const totalorderPrice = cartPrice;

  const user = await userModel.findById(cart.user);

  if (!user) {
    return next(
      new ApiError(`No user found for this id:${req.params.cartId}`, 400)
    );
  }

  // cart details for paytabs payment method
  let cart_for_paytabs = {
    id: req.params.cartId,
    currency: "EGP",
    amount: totalorderPrice,
    description: `Online Payment for user: ${user.email}`,
  };

  let cart_details = [
    cart_for_paytabs.id,
    cart_for_paytabs.currency,
    cart_for_paytabs.amount,
    cart_for_paytabs.description,
  ];

  let customer = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    street: req.body.shippingAddress.details,
    city: "Alexandria",
    state: "Alexandira",
    country: "EG",
    zip: "",
  };

  let customer_details = [
    customer.name,
    customer.email,
    customer.phone,
    customer.street,
    customer.city,
    customer.state,
    customer.country,
    customer.zip,
  ];

  let shipping_address = customer_details;
  let lang = "en";

  let url = {
    callback: `${process.env.PAYTABS_CALLBACK_URL}`,
  };

  let response_URLs = [url.callback];

  const paymentPageCreated = ($results) => {
    if (res.statusCode == 200) {
      res.status(res.statusCode).json({
        message: "Payment page created",
        paymentURL: $results.redirect_url,
      });
    } else {
      res
        .status(res.statusCode)
        .json({ message: "failed creating payment page" });
    }
  };

  let frameMode = true;

  paytabs.createPaymentPage(
    paymentMethods,
    transaction_details,
    cart_details,
    customer_details,
    shipping_address,
    response_URLs,
    lang,
    paymentPageCreated,
    frameMode
  );
});

exports.paymentWebhook = asyncHandler(async (req, res, next) => {
  const profileID = process.env.profileID,
    serverKey = process.env.serverKey,
    region = process.env.region;

  paytabs.setConfig(profileID, serverKey, region);

  let tranRef = req.body.tran_ref;

  try {
    paytabs.validatePayment(tranRef, async (response) => {
      if (response.payment_result.response_status !== "A") {
        return next(
          new ApiError(
            `payment failed with status: ${response.payment_result.response_status}, reason: ${response.payment_result.response_message}`,
            403
          )
        );
      }

      // get cart depends on cartId
      const cart = await cartModel.findById(req.body.cart_id);

      // set order price depend on cart total price
      const cartPrice = cart.totalCartPrice;
      const totalorderPrice = cartPrice;

      if (!cart) {
        return next(
          new ApiError(`No cart found for this id:${req.body.cart_id}`, 404)
        );
      }

      // create order with online payment method
      const order = await orderModel.create({
        user: cart.user,
        orderNumber: `SA-4000${Math.floor(Math.random() * 1000000000)}`,
        cartItems: cart.cartItems,
        totalorderPrice,
        shippingAddress: {
          name: req.body.shipping_details.name,
          details: req.body.shipping_details.street1,
          city: req.body.shipping_details.city,
          state: req.body.shipping_details.state,
          phone: req.body.shipping_details.phone,
        },
        paymentMethod: "online payment",
        isPaid: true,
      });

      if (order) {
        // clear cart depending on cartId
        await cartModel.findByIdAndDelete(req.body.cart_id);
      }
      console.log(order);

      res.status(200).json({ message: "Success" });
    });
  } catch (error) {
    res.status(400).json({ message: `Webhook error: ${error.message}` });
  }
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

exports.findAllOrders = factory.getAll(orderModel);

exports.findSpecificOrder = factory.getOne(orderModel);

exports.findSpecificOrderByOrderNumber = asyncHandler(
  async (req, res, next) => {
    const { orderNumber } = req.body;
    const order = await orderModel.findOne({ orderNumber: orderNumber });
    if (!order) {
      return next(
        new ApiError(
          `No order found with this order number:${orderNumber}`,
          404
        )
      );
    }
    res.status(200).json({ data: order });
  }
);

exports.updateOrdertoPaid = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`No such order with this id: ${req.params.order}`, 404)
    );
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ message: "success", data: updatedOrder });
});

exports.updateOrderToDeliverd = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`No such order with this id: ${req.params.order}`, 404)
    );
  }

  // update order to paid
  order.isDeliverd = true;
  order.deliverdAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ message: "success", data: updatedOrder });
});
