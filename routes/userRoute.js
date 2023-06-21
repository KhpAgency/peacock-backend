const express = require("express");
const multer = require("multer");

const {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateuser,
  updateUserPassword,
} = require("../controllers/userController");

const {
  getUserValidator,
  createUserValidator,
  deleteUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
} = require("../utils/validators/userValidator");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");

Router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  updateUserPassword
);

Router.route("/")
  .get(protect, allowedTo("admin", "manager"), getUsers)
  .post(protect, allowedTo("admin"), createUserValidator, createUser);
Router.route("/:id")
  .get(getUserValidator, getUser)
  .delete(protect, allowedTo("admin"), deleteUserValidator, deleteUser)
  .put(protect, allowedTo("admin"), updateUserValidator, updateuser);

module.exports = Router;
