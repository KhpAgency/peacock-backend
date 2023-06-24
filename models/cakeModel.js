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
    categoryName: {
      type: String,
      default: "Cake",
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
      const imgURL = `${process.env.BASE_URL}/cakes/${image}`;
      imageList.push(imgURL);
    });
    doc.images = imageList;
  }
};

cakeSchema.post("init", (doc) => {
  setImageURL(doc);
});
cakeSchema.post("save", (doc) => {
  setImageURL(doc);
});

const Cake = mongoose.model("Cake", cakeSchema);
module.exports = Cake;
