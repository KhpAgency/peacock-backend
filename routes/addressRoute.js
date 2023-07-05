const express = require("express");

const {
  addNewAddress,
  deleteAddress,
  getLoggedUserAddress,
} = require("../controllers/addressesController");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");

Router.use(protect, allowedTo("user"));
Router.route("/").post(addNewAddress).get(getLoggedUserAddress);
Router.route("/:addressId").delete(deleteAddress);

module.exports = Router;
