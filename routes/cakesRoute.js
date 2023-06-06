const express = require("express");
const multer  = require('multer')

const {
  getCakes,
  getCake,
  createCake,
  deleteCake,
} = require("../controllers/cakesController");

const {
  getCakeValidator,
  createCakeValidator,
  deleteCakeValidator,
} = require("../utils/validators/cakesValidator");

const Router = express.Router();
const upload = multer({ dest: 'uploads/cakes' })



Router.route("/")
  .get(getCakes)
  .post(upload.array("images", 4),createCakeValidator, createCake);
Router.route("/:id")
  .get(getCakeValidator, getCake)
  .delete(deleteCakeValidator, deleteCake);
  
module.exports = Router;
