const express = require("express");

const {
  getTrays,
  getTray,
  createTray,
  deleteTray,
} = require("../controllers/traysController");

const {
  getTrayValidator,
  createTrayValidator,
  deleteTrayValidator,
} = require("../utils/validators/traysValidator");

const Router = express.Router();

Router.route("/")
  .get(getTrays)
  .post(createTrayValidator, createTray);
Router.route("/:id")
  .get(getTrayValidator, getTray)
  .delete(deleteTrayValidator, deleteTray);
  
module.exports = Router;
