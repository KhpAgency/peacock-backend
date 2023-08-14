const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      lowercase: true,
    },
    email: {
      type: String,
      unique: [true, "Email must be unique"],
      required: [true, "Email is required"],
      lowercase: true,
    },
    phone: {
      type: String,
      unique: [true, "Phone must be unique"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    passwordChangedAT: Date,
    passwordResetCode: String,
    passwordResetCodeExpire: Date,
    passwordResetCodeVerified: Boolean,
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        name: String,
        details: String,
        city: String,
        state: String,
        phone: String,
      },
    ],
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Password hashing
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
