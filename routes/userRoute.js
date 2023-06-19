const express = require("express");
const multer = require("multer");

const {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateuser,
  updateUserPassword
} = require("../controllers/userController");

const {
  getUserValidator,
  createUserValidator,
  deleteUserValidator,
  updateUserValidator,
} = require("../utils/validators/userValidator");

const Router = express.Router();

Router.put("/changePassword/:id", updateUserPassword)

Router.route("/").get(getUsers).post(createUserValidator, createUser);
Router.route("/:id")
  .get(getUserValidator, getUser)
  .delete(deleteUserValidator, deleteUser)
  .put(updateUserValidator, updateuser);

module.exports = Router;
