const mongoose = require("mongoose");

const cakeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Name is required"],
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
    size: {
      type: [String],
      required: [true, "Size is required"],
    },
  },
  { timestamps: true }
);

const Cake = mongoose.model("Cake", cakeSchema);
module.exports = Cake;
