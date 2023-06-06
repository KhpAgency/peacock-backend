const mongoose = require("mongoose");

const packagesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Name is required"],
      unique: [true, "Title must be unique"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
    },
    images: {
      type: [String],
      required: [true, "Images are required"],
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
    weight: {
      type: [String],
      required: [true, "Weight is required"],
    },
  },
  { timestamps: true }
);

const Packages = mongoose.model("Packages", packagesSchema);
module.exports = Packages;
