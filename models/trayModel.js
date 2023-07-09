const mongoose = require("mongoose");

const traySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Name is required"],
      unique: false,
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
    categoryName: {
      type: String,
      default: "Tray",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.images) {
    const imageList = [];
    doc.images.forEach((image) => {
      const imgURL = `${process.env.BASE_URL}/trays/${image}`;
      imageList.push(imgURL);
    });
    doc.images = imageList;
  }
};

traySchema.post("init", (doc) => {
  setImageURL(doc);
});
traySchema.post("save", (doc) => {
  setImageURL(doc);
});

traySchema.pre("save", function (next) {
  this.images.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  next();
});

const Tray = mongoose.model("Tray", traySchema);
module.exports = Tray;
