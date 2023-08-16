const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./controllersFactory");
const paytabs = require("paytabs_pt2");

const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const sendEmail = require("../utils/sendEmails");

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

  // send order confirmation email
  let capitalizeFirlstLetterOfName =
    req.user.name.split(" ")[0].charAt(0).toUpperCase() +
    req.user.name.split(" ")[0].slice(1).toLocaleLowerCase();

  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  let currentDate = `${day}-${month}-${year}`;

  let emailTamplate = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <style>
      body {
        font-family: "Montserrat", sans-serif;
      }
      .logo {
        background-color: #a8c7c7;
        padding: 15px;
        text-align: center;
      }
      .invoice {
        padding: 25px;
      }
      .invoice h5 {
        font-weight: bold;
        text-align: center;
        margin-top: 20px;
      }
      .invoice span {
        font-weight: bold;
        display: block;
        margin-top: 10px;
      }
      .payment {
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        margin-top: 20px;
        padding: 15px;
      }
      .product {
        border-bottom: 1px solid #ccc;
        margin-bottom: 20px;
      }
      .product-qty span {
        font-size: 12px;
        color: #dedbdb;
      }
      .totals {
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .totals td {
        padding: 5px 0;
      }
      .totals .text-left {
        text-align: left;
      }
      .totals .text-right {
        text-align: right;
      }
      .totals .text-muted {
        color: #777;
      }
      .footer {
        background-color: #eeeeeea8;
        padding: 15px;
      }
      .footer span {
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="row d-flex justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="logo">
            <img src="https://peacockchocolateksa.com/img/Asset%202.png" width="150" alt="Logo">
          </div>
          <div class="invoice">
            <h5>Your order Confirmed!</h5>
            <span class="font-weight-bold d-block mt-4">Hello, ${capitalizeFirstLetterOfName}</span>
            <span>Thank you for your order from Peacock. Your order has been confirmed!</span>
            <div class="payment">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <span class="d-block text-muted">Order Date</span>
                      <span>${currentDate}</span>
                    </td>
                    <td>
                      <span class="d-block text-muted">Order No</span>
                      <span>${order.orderNumber}</span>
                    </td>
                    <td>
                      <span class="d-block text-muted">Payment</span>
                      <span>Cash on delivery</span>
                    </td>
                    <td>
                      <span class="d-block text-muted">Shipping Address</span>
                      <span>${order.shippingAddress.details}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="product">
              <table>
                <tbody>
                  ${order.cartItems.map((item) => `
                  <tr>
                    <td width="60%">
                      <span class="font-weight-bold">${item.productID}</span>
                      <div class="product-qty">
                        <span class="d-block">Size: ${item.variant}</span>
                        <span class="d-block">Quantity: ${item.quantity}</span>
                      </div>
                    </td>
                    <td width="20%">
                      <div class="text-right">
                        <span class="font-weight-bold">${item.price} SAR</span>
                      </div>
                    </td>
                  </tr>
                  `)}
                </tbody>
              </table>
            </div>
            <div class="row d-flex justify-content-end">
              <div class="col-md-5">
                <table class="totals">
                  <tbody>
                    <tr>
                      <td class="text-left">
                        <span class="text-muted">Subtotal</span>
                      </td>
                      <td class="text-right">
                        <span>${order.totalOrderPrice}</span>
                      </td>
                    </tr>
                    <tr>
                      <td class="text-left">
                        <span class="text-muted">Shipping Fee</span>
                      </td>
                      <td class="text-right">
                        <span>00</span>
                      </td>
                    </tr>
                    <tr class="border-top border-bottom">
                      <td class="text-left">
                        <span class="font-weight-bold">Total</span>
                      </td>
                      <td class="text-right">
                        <span class="font-weight-bold">${order.totalOrderPrice}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="footer">
              <span class="text-muted">Thank you for shopping with us!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`

  try {
    await sendEmail({
      email: req.user.email,
      subject: `${capitalizeFirlstLetterOfName}, Your order has been placed`,
      message: emailTamplate,
    });
  } catch (error) {
    console.log(error);
  }

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
    // return: 'https://webhook.site/92a3aee6-14f2-4b80-b8b9-c5c014a2e96f'
  };

  let response_URLs = [url.callback, url.return];

  const paymentPageCreated = ($results) => {
    if (res.statusCode == 200) {
      res.status(res.statusCode).json({
        message: "Payment page created",
        paymentURL: $results.redirect_url,
        result: $results,
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
  console.log(`Received payment webhook for transaction reference: ${tranRef}`);

  paytabs.validatePayment(tranRef, async (response) => {
    if (response.payment_result.response_status !== "A") {
      const errorMessage = `Payment failed with status: ${response.payment_result.response_status}, reason: ${response.payment_result.response_message}`;
      console.error(errorMessage);
      return next(new ApiError(errorMessage, 403));
    }

    // get cart depends on cartId
    const cart = await cartModel.findById(req.body.cart_id);

    // set order price depend on cart total price
    const cartPrice = cart.totalCartPrice;
    const totalorderPrice = cartPrice;

    if (!cart) {
      const errorMessage = `No cart found for this id: ${req.body.cart_id}`;
      console.error(errorMessage);
      return next(new ApiError(errorMessage, 404));
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
    console.log(`Created order: ${order}`);
    res.send({ order: order });
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
