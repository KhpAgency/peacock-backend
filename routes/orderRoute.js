const express = require("express");

const {
  createCashOrder,
  filterOrderForLoggedUser,
  findAllOrders,
  findSpecificOrder,
  updateOrderToDeliverd,
  updateOrdertoPaid
} = require("../controllers/orderController");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");

Router.use(protect);

Router.route("/:cartId").post(allowedTo("user"), createCashOrder);

Router.get(
  "/",
  allowedTo("user", "admin", "manager"),
  filterOrderForLoggedUser,
  findAllOrders
);
Router.get("/:id", allowedTo("user", "admin", "manager"), findSpecificOrder);

Router.put("/:id/delivery", allowedTo("admin", "manager"), updateOrderToDeliverd);
Router.put("/:id/pay", allowedTo("admin", "manager"), updateOrdertoPaid);

module.exports = Router;
