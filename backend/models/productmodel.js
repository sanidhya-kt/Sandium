const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please Enter Product name"],
    trim: true,
  },

  product_description: {
    type: String,
    required: [true, "please Enter product des"],
  },

  price: {
    type: Number,
    required: [true, "please Enter Product price"],
    maxLength: [8, "not more than 8 character"],
  },

  ratings: { type: Number, default: 0 },

  image: [
    {
      public_id: { type: String, required: true },

      product_url: { type: String, required: true },
    },
  ],

  product_category: {
    type: String,
    required: [true, "Enter Product Category"],
  },

  Stock: {
    type: String,
    required: [true, "please Enter Product price"],
    maxLength: [8, "not more than 8 character"],
    default: 1,
  },

  numOfReviews: { type: Number, default: 0 },

  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },

      name: { type: String, required: true },

      rating: { type: Number, required: true },

      comment: { type: String, required: true },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("product", productSchema);
