const mongoose = require("mongoose");

const boxSchema = new mongoose.Schema(
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
    pieces: {
      type: [String],
      required: [true, "Weight is required"],
    },
    categoryName: {
      type: String,
      default: "Chocolate Boxs",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,

      ref : "Category"
    }
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.images) {
    const imageList = [];
    doc.images.forEach((image) => {
      const imgURL = `${process.env.BASE_URL}/chocolateBox/${image}`;
      imageList.push(imgURL);
    });
    doc.images = imageList;
  }
};

boxSchema.post("init", (doc) => {
  setImageURL(doc);
});
boxSchema.post("save", (doc) => {
  setImageURL(doc);
});

const ChocolateBox = mongoose.model("ChocolateBox", boxSchema);
module.exports = ChocolateBox;
