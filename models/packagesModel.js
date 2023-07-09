const mongoose = require("mongoose");

const packagesSchema = new mongoose.Schema(
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
      default: "Packages",
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
      const imgURL = `${process.env.BASE_URL}/packages/${image}`;
      imageList.push(imgURL);
    });
    doc.images = imageList;
  }
};

packagesSchema.post("init", (doc) => {
  setImageURL(doc);
});
packagesSchema.post("save", (doc) => {
  setImageURL(doc);
});

packagesSchema.pre("save", function (next) {
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
const Packages = mongoose.model("Packages", packagesSchema);
module.exports = Packages;
