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

  console.log(cart);

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
    shippingAddress: req.body.shippingAddress
  });

  // send order confirmation email
  let capitalizeFirlstLetterOfName =
    req.user.name.split(" ")[0].charAt(0).toUpperCase() +
    req.user.name.split(" ")[0].slice(1).toLocaleLowerCase();

  let emailTamplate = `<!DOCTYPE html>
  <html lang="en-US">
    <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
      <title>Confirm Your Email</title>
      <meta name="description" content="Reset Password Email" />
      <style type="text/css">
        a:hover {
          text-decoration: underline !important;
        }
      </style>
    </head>

    <body
      marginheight="0"
      topmargin="0"
      marginwidth="0"
      style="margin: 0px; background-color: #f2f3f8"
      leftmargin="0"
    >
      <!--100% body table-->
      <table
        cellspacing="0"
        border="0"
        cellpadding="0"
        width="100%"
        bgcolor="#f2f3f8"
        style="
          @import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700);
          font-family: 'Open Sans', sans-serif;
        "
      >
        <tr>
          <td>
            <table
              style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto"
              width="100%"
              border="0"
              align="center"
              cellpadding="0"
              cellspacing="0"
            >
              <tr>
                <td style="height: 80px">&nbsp;</td>
              </tr>
              <tr>
                <td style="text-align: center">
                  <a href="http://www.peacockchocolateksa.com" title="logo" target="_blank">
                    <img
                      width="250"
                      src="http://www.peacockchocolateksa.com/img/Asset%202.png"
                      title="logo"
                      alt="logo"
                    />
                  </a>
                </td>
              </tr>
              <tr>
                <td style="height: 20px">&nbsp;</td>
              </tr>
              <tr>
                <td>
                  <table
                    width="95%"
                    border="0"
                    align="center"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      max-width: 670px;
                      background: #fff;
                      border-radius: 3px;
                      text-align: center;
                      -webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                      -moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                      box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                    "
                  >
                    <tr>
                      <td style="height: 40px">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="padding: 0 35px">
                        <h1
                          style="
                            color: #1e1e2d;
                            font-weight: 500;
                            margin: 0;
                            font-size: 30px;
                            font-family: 'Rubik', sans-serif;
                          "
                        >
                          Confirm Your Email
                        </h1>
                        <span
                          style="
                            display: inline-block;
                            vertical-align: middle;
                            margin: 29px 0 26px;
                            border-bottom: 1px solid #cecece;
                            width: 200px;
                          "
                        ></span>
                        <p
                          style="
                            color: #455056;
                            font-size: 17px;
                            line-height: 24px;
                            text-align: left;
                          "
                        >
                          Hello ${capitalizeFirlstLetterOfName},</p>
                        <p
                          style="
                            color: #455056;
                            font-size: 17px;
                            line-height: 24px;
                            text-align: left;
                          "
                        >
                          Thank you for registering in Peacock. To start using your account please confirm your email address by clicking on the confirm your email button.
                        </p>
                        <a target="_blank" href="https://peacock-api-ixpn.onrender.com/api/v1/auth/confirm-email/${token}"
                        style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:25px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Confirm Your Email</a>

                        <p
                          style="
                            color: #455056;
                            font-size: 17px;
                            line-height: 24px;
                            text-align: left;
                          "
                        >
                          Welcome to Peacock,
                        </p>
                        <p
                          style="
                          margin-top: 3px;
                            color: #455056;
                            font-size: 17px;
                            line-height: 2px;
                            text-align: left;
                          "
                        >
                          The Peacock Team.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="height: 40px">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="height: 20px">&nbsp;</td>
              </tr>
              <tr>
                <td style="text-align: center">
                  <p
                    style="
                      font-size: 14px;
                      color: rgba(69, 80, 86, 0.7411764705882353);
                      line-height: 18px;
                      margin: 0 0 0;
                    "
                  >
                    &copy; <strong>www.peacockchocolateksa.com</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="height: 80px">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!--/100% body table-->
    </body>
  </html>`;

  try {
    await sendEmail({
      email: user.email,
      subject: `${capitalizeFirlstLetterOfName}, Please confirm your peacock email`,
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
