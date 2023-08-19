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
        required: true,
      },
      variant: String,
      quantity: { type: Number, default: 1 },
      price: Number,
    },
  ],
  totalCartPrice: Number,
});

// cartSchema.pre("save", function(next) {
//   this.populate("user");
//   this.populate({path: "cartItems.productID", select:"-pieces -size -weight"});
//   next();
// });

// cartSchema.post(/^find/, function(next) {
//   this.populate({path: "user"}).populate({path: "cartItems.productID", select:"-pieces -size -weight"})
// })



module.exports = mongoose.model("Cart", cartSchema);
