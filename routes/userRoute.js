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
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData
  //----- /User's Routes -----
} = require("../controllers/userController");

const {
  getUserValidator,
  createUserValidator,
  deleteUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserDataValidator,
} = require("../utils/validators/userValidator");

const { protect, allowedTo } = require("../controllers/authController");

//----- User Routes -----

// applied on all routes
Router.use(protect);

Router.get("/getLoggedUser", getLoggedUser, getUser);
Router.put("/updateLoggedUserPassword", updateLoggedUserPassword);
Router.put(
  "/updateLoggedUserData",
  updateLoggedUserDataValidator,
  updateLoggedUserData
);
Router.delete("/deleteLoggedUserData" , deleteLoggedUserData)

//----- /User Routes -----

//----- Admin Routes -----

Router.use(allowedTo("admin", "manager"));

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
