const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItems: [
    {
      productCategory: {
        type: String,
        enum: ["Cake", "ChocolateBox", "Tray", "Packages"],
        required: true,
      },
      productID: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "cartItems.productCategory",
      },
      variant: String,
      quantity: { type: Number, default: 1 },
      price: Number,
    },
  ],
  totalCartPrice: Number,
});

// cartSchema.post("save", function(next) {
//   this.populate({path: "user"}).populate({path: "cartItems.productID", select:`-pieces -size -weight`})
//   next()
// })


cartSchema.post("save", function () {
  const doc = this;
  const Cart = mongoose.model("Cart");
  Cart.findById(doc._id)
    .populate({ path: "user" })
    .populate({ path: "cartItems.productID", select: "-pieces -size -weight" })
    .exec();
});

module.exports = mongoose.model("Cart", cartSchema);
