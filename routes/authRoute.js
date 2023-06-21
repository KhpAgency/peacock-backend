const express = require("express");

const {
  signup,
  login,
  forgetPassword,
  verifyPasswordResetCode,
  resetPassword
} = require("../controllers/authController");

const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const Router = express.Router();

Router.post("/signup", signupValidator, signup);
Router.post("/login", loginValidator, login);
Router.post("/forgetPassword", forgetPassword);
Router.post("/verifyResetcode", verifyPasswordResetCode);
Router.put("/resetPassword", resetPassword);

// Router.route("/:id")
//   .get(getUserValidator, getUser)
//   .delete(deleteUserValidator, deleteUser)
//   .put(updateUserValidator, updateuser);

module.exports = Router;
