const factory = require("./controllersFactory");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");
const ApiError = require("../utils/ApiError");

exports.getUsers = factory.getAll(userModel);

exports.getUser = factory.getOne(userModel);

exports.createUser = factory.createOne(userModel);

exports.updateuser = asyncHandler(async (req, res, next) => {
  const { name, slug, email, phone } = req.body;

  const User = await userModel.findByIdAndUpdate(
    req.params.id,
    { name, slug, email, phone },
    {
      new: true,
    }
  );

  if (!User) {
    return next(new ApiError(`No User for this id:${req.params.id}`, 404));
  }
  res.status(200).json({ data: User });
});

exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const User = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(password, 12),
      passwordChangedAT: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!User) {
    return next(new ApiError(`No User for this id:${req.params.id}`, 404));
  }
  res.status(200).json({ data: User });
});

exports.deleteUser = factory.deleteOne(userModel);
