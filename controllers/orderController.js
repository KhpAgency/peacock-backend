const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./controllersFactory");
const paytabs = require("paytabs_pt2");

const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const axios = require("axios");

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
  callback: `${process.env.NODE_ENV}`,
};

let response_URLs = [url.callback];

const paymentPageCreated = ($results) => {
  console.log($results);
  
};

 paytabs.createPaymentPage(
  paymentMethods,
  transaction_details,
  cart_details,
  customer_details,
  shipping_address,
  response_URLs,
  lang,
  paymentPageCreated,
  frameMode=true
);



});

// exports.createOnlinePaymentOrder = asyncHandler(async (req, res, next) => {
//   // get cart depends on cartId
//   const cart = await cartModel.findById(req.params.cartId);

//   if (!cart) {
//     return next(
//       new ApiError(`No cart found for this id:${req.params.cartId}`, 404)
//     );
//   }

//   // set order price depend on cart total price
//   const cartPrice = cart.totalCartPrice;
//   const totalorderPrice = cartPrice;

//   const user = await userModel.findById(cart.user);

//   if (!user) {
//     return next(
//       new ApiError(`No user found for this id:${req.params.cartId}`, 404)
//     );
//   }

//   const url = "https://secure-egypt.paytabs.com/payment/request";
//   data = {
//     profile_id: process.env.profileID,
//     tran_type: "sale",
//     tran_class: "ecom",
//     cart_description: `Online Payment for user: ${user.email}`,
//     cart_id: `${req.params.cartId}`,
//     cart_currency: "EGP",
//     cart_amount: totalorderPrice,
//     callback: `https://peacock-api-ixpn.onrender.com/api/v1/orders/${req.params.cartId}`,
//     response: `http://localhost:3000/api/v1/orders/paymentdetails/${req.params.cartId}`,
//   };

//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/JSON",
//       "Authorization": process.env.serverKey
//     },
//     url,
//     data,
//   };

//   axios.request(options).then(response => {
//     console.log(response);
//     res.send(response)
//   }).catch(error =>{
//     console.log(error);

//   })
// });

exports.paymentWebhook = asyncHandler(async (req, res, next) => {
  // Get the transaction ID and amount from the request body
  const transactionID = req.body.transactionID;
  const amount = req.body.amount;

  console.log(transactionID);

  // Verify the payment
  paytabs.verifyPayment(transactionID, amount, (err, response) => {
    // if (err) {
    //   // The payment could not be verified
    //   res.status(400).json({
    //     message: "Payment could not be verified",
    //     error: err,
    //   });
    // } else {
    //   // The payment was verified
    //   const order = Order.findOne({ transactionID });

    //   if (order) {
    //     order.status = "paid";
    //     order.save();

    //     res.status(200).json({
    //       message: "Payment was successful",
    //     });
    //   } else {
    //     // Order not found
    //     res.status(404).json({
    //       message: "Order not found",
    //     });
    //   }
    // }
  });

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
