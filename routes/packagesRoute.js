const express = require("express");

const {
  getPackages,
  getPackage,
  createPackage,
  deletePackage,
  uploadPackagesImages,
  resizePackagesImages,
} = require("../controllers/packagesController");

const {
  getPackageValidator,
  createPackageValidator,
  deletePackageValidator,
} = require("../utils/validators/packagesValidator");

const Router = express.Router();
const { protect, allowedTo } = require("../controllers/authController");

Router.route("/")
  .get(getPackages)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadPackagesImages,
    resizePackagesImages,
    createPackageValidator,
    createPackage
  );
Router.route("/:id")
  .get(getPackageValidator, getPackage)
  .delete(protect, allowedTo("admin"), deletePackageValidator, deletePackage);

module.exports = Router;
