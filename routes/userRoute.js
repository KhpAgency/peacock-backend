const express = require("express");
const multer = require("multer");
const Router = express.Router();

const {
  //----- Admin Routes -----
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateuser,
  updateUserPassword,
  //----- /Admin Routes -----

  //----- User's Routes -----
  getLoggedUser,
  updateLoggedUserPassword
  //----- /User's Routes -----
} = require("../controllers/userController");

const {
  getUserValidator,
  createUserValidator,
  deleteUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
} = require("../utils/validators/userValidator");


const { protect, allowedTo } = require("../controllers/authController");

//----- User Routes -----

Router.get("/getLoggedUser",protect, getLoggedUser, getUser);
Router.put("/updateLoggedUserPassword",protect, updateLoggedUserPassword);

//----- /User Routes -----

//----- Admin Routes -----

Router.use(protect, allowedTo("admin", "manager"));

Router.route("/").get(getUsers).post(createUserValidator, createUser);

Router.route("/:id")
  .get(getUserValidator, getUser)
  .delete(deleteUserValidator, deleteUser)
  .put(updateUserValidator, updateuser);

Router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  updateUserPassword
);

//----- /Admin Routes -----

module.exports = Router;
