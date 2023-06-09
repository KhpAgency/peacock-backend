const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
  orderNumber : String,
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
    shippingAddress: Object,
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

orderSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "_id name email phone" }).populate({
    path: "cartItems.productID",
    select:
      "_id title images description price discountedPrice categoryName categoryId",
  });
  next();
});

module.exports = mongoose.model("Order", orderSchema);
