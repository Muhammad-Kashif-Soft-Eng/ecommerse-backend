const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String, // the full Cloudinary URL e.g. https://res.cloudinary.com/...
      required: true,
      trim: true,
    },
    imagePublicId: {
      type: String, // Cloudinary's ID for this file — needed to update/delete it
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["Mobile", "Laptop", "Headphones"],
      index: true,
    },

    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
