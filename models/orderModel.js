const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
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
        quantity: Number,
        price: Number,
      },
    ],
    shippingPrice: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: "cash on delivery",
    },
    totalorderPrice: Number,
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDeliverd: {
      type: Boolean,
      default: false,
    },
    deliverdAt: Date,
  },
  { timestamps: true }
);


orderSchema.pre(/^find/, function(next) {
  this.populate({path: "user"}).populate({path: "cartItems.productID", select:"-pieces -size -weight"})
  next()
})

module.exports = mongoose.model("Order", orderSchema);
