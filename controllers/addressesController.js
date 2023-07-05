const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");

exports.addNewAddress = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Addresses added successfully",
    data: user.addresses,
  });
});

exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Addresses deleted",
    data: user.addresses,
  });
});

exports.getLoggedUserAddress = asyncHandler(async (req, res, next) => {
  const user = await userModel
    .findByIdAndUpdate(req.user._id)
    .populate("addresses");

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
