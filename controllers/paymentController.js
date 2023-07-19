const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const userModel = require("../models/userModel");
 

exports.createOnlinePaymentOrder = asyncHandler(async (req, res, next) => {

const paytabs = require('paytabs_pt2');

let
    profileID = "124772",
    serverKey = "SBJ9LJWGKT-J6NGZD6HMR-ZGNK2LMKBN",
    region = "EGY";

paytabs.setConfig( profileID, serverKey, region);

let paymentMethods = ["all"];

let transaction = {
    type:"sale",
    class:"ecom"
};

let transaction_details = [
    transaction.type,
    transaction.class
];

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

  // cart details for paytabs payment method
  let cart_for_paytabs={
    id:req.params.cartId,
    currency:"EGP",
    amount:totalorderPrice,
    description:`Online Payment for user ID:${cart.user}`
  }

  let cart_details = [cart_for_paytabs.id, cart_for_paytabs.currency, cart_for_paytabs.amount, cart_for_paytabs.description];
  
  const user = await userModel.findById(cart.user)

  if (!user) {
    return next(
      new ApiError(`No user found for this id:${req.params.cartId}`, 404)
    );
  }
  

  let customer = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    street: req.body.shippingAddress.details,
    city: "",
    state: "SA",
    country: "SA",
    zip: "",
  }

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
let lang = "ar";

let response_URLs = [
  url.callback,
  url.response
];

paytabs.createPaymentPage(
  paymentMethods,
  transaction_details,
  cart_details,
  customer_details,
  shipping_address,
  response_URLs,                // URLs array
  lang,
  paymentPageCreated
);


paymentPageCreated = function ($results) {
    console.log($results);
}

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


})