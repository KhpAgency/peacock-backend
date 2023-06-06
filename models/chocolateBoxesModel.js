const mongoose = require("mongoose");

const boxSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Name is required"],
      unique: [true , "Title must be unique"]
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
    },
    images: {
      type: [String],
      required: [true, "images are required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    discountedPrice: {
      type: Number,
    },
    pieces: {
      type: [String],
      required: [true, "Weight is required"],
    },
  },
  { timestamps: true }
);

const ChocolateBox = mongoose.model("ChocolateBox", boxSchema);
module.exports = ChocolateBox;
