const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItems: [
    {
      product: {
        type: String,
        enum: ["Cake", "ChocolateBox", "Tray", "Packages"],
        required: true,
      },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "cartItems.product",
      },
      variant: String,
      quantity: { type: Number, default: 1 },
      price: Number,
    },
  ],
  totalCartPrice: Number,
});

module.exports = mongoose.model("Cart", cartSchema);
