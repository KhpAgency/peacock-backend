const express = require("express");

const {
  getPackages,
  getPackage,
  createPackage,
  deletePackage,
} = require("../controllers/packagesController");

const {
  getPackageValidator,
  createPackageValidator,
  deletePackageValidator,
} = require("../utils/validators/packagesValidator");

const Router = express.Router();

Router.route("/")
  .get(getPackages)
  .post(createPackageValidator, createPackage);
Router.route("/:id")
  .get(getPackageValidator, getPackage)
  .delete(deletePackageValidator, deletePackage);
  
module.exports = Router;
