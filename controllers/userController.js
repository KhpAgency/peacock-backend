const factory = require("./controllersFactory");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const createToken = require("../utils/createToken");

//----- Admin Routes -----

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

//----- /Admin Routes -----

//----- User Routes -----

exports.getLoggedUser = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  //1) update user password based on user's payload (req.user._id)
  const { newPassword } = req.body;

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(newPassword, 12),
      passwordChangedAT: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) generate new token

  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ message:'Success'})
});

//----- /User Routes -----
