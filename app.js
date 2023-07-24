const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const ApiError = require("./utils/ApiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const paytabs = require("paytabs_pt2");

const userRoute = require("./routes/userRoute");
const categoriesRoute = require("./routes/categoriesRoute");
const chocolateBoxRoute = require("./routes/chocolateBoxRoute");
const trayRoute = require("./routes/trayRoute");
const packageRoute = require("./routes/packagesRoute");
const cakeRoute = require("./routes/cakesRoute");
const authRoute = require("./routes/authRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const addressRoute = require("./routes/addressRoute");

// middlewares

app.use(cors());
app.options("*", cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// DB connecetion
dbConnection();

// Mount Routes
app.use("/api/v1/categories", categoriesRoute);
app.use("/api/v1/login", userRoute);
app.use("/api/v1/chocolatebox", chocolateBoxRoute);
app.use("/api/v1/tray", trayRoute);
app.use("/api/v1/packages", packageRoute);
app.use("/api/v1/cake", cakeRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/addresses", addressRoute);

const cartModel = require("./models/cartModel");
const orderModel = require("./models/orderModel");
const { protect, allowedTo } = require("./controllers/authController");

app.post("/api/v1/payments-webhook", (req, res, next) => {
  const profileID = process.env.profileID,
    serverKey = process.env.serverKey,
    region = process.env.region;

  paytabs.setConfig(profileID, serverKey, region);

  let tranRef = req.body.tran_ref;

  paytabs.validatePayment(tranRef, async (response) => {
    if (response.payment_result.response_status === "A") {
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

      res.status(200).redirect("https://khpagency-eg.com/peacock/orderconfirmation.html");
    } else {
      res.status(402).json({ status: "payment failed" });
    }
  });
});

app.all("*", (req, res, next) => {
  next(new ApiError(`can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalError);

const server = app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${PORT}!`)
);

// UnhandledRejections event handler (rejection outside express)
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("server shutting down...");
    process.exit(1);
  });
});
