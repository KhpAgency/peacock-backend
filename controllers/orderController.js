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

  // Populate the productID field
  const populatedOrder = await orderModel.populate(order, {
    path: "cartItems.productID",
  });

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

  let emailTamplate = `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Order Confirmation</title>
    <style>
      /* Inline styles */
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #333333;
        background-color: #f8f8f8;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }

      .logo {
        display: block;
        margin-bottom: 20px;
        text-align: center;
      }

      .logo img {
        max-width: 200px;
      }

      .order-summary {
        margin-bottom: 30px;
        background-color: #edeaea;
        border-radius: 5px;
        padding: 20px;
      }

      .order-summary h2 {
        font-size: 24px;
        font-weight: 700;
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
      }

      .order-summary table {
        width: 100%;
        border-collapse: collapse;
      }

      .order-summary th,
      .order-summary td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #dddddd;
      }

      .order-summary th {
        background-color: #f7f7f7;
        font-weight: 600;
      }

      .order-summary tbody tr:last-child td {
        border-bottom: none;
      }

      .order-total {
        text-align: right;
        margin-top: 20px;
      }

      .thank-you {
        text-align: center;
      }

      .thank-you p {
        font-size: 18px;
        margin-bottom: 0;
      }

      .font-weight {
        font-weight: 600;
      }

      .d-block{
        display: block;
      }

      h3{
        text-align: center;

      }

      section p {
        display: inline;
      }
    </style>
  </head>
  <body style="background-color: #989898ac;">
    <div class="container">
      <div class="logo">
        <img src="https://peacockchocolateksa.com/img/Asset%202.png" alt="Your Logo" />
      </div>

      <div class="order-summary">
        <h2>Order Placed</h2>
            <span class="font-weight d-block">Hello, ${capitalizeFirlstLetterOfName}</span>
            <span class="d-block">Thank you for your order from Peacock. Your order has been placed!</span>
            <span class="d-block">Order Number: ${order.orderNumber}</span>
            


            <section>
              <div>
                <h3>Order Details:</h3>
                <span>Name: </span><span>${order.shippingAddress.name}</span>
                <br>
                <span>Details: </span><span>${order.shippingAddress.details}</span>
                <br>
                <span>City: </span><span>${order.shippingAddress.city}</span>
                <br>
                <span>Phone: </span><span>${order.shippingAddress.phone}</span>
                <br>
                <br>
              </div>
            </section>


        <table>
          <thead>
            <tr>
              <th>Items</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
          ${order.cartItems.map(item=> `
          <tr>
            <td>${item.productID.title}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
          </tr>
        `)}

            

          </tbody>
        </table>

        <div class="order-total">
          <p>Subtotal: ${order.totalorderPrice} SAR</p>
          <p>Delivery Fees: 00</p>
          <p>Total: ${order.totalorderPrice} SAR</p>
        </div>

        

        <div class="thank-you" style="text-align: left;">
          <p>Thank you for your order!</p>
          <p style="margin-top: 0;">Peacock Team.</p>
        </div>
      </div>

      
    </div>
  </body>
</html>
  `

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
