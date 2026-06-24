const Product = require("../models/product.model");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("./image.controller");

// Create Product
exports.createProduct = async (req, res, next) => {
  try {
    const image = req.file;

    if (!image) {
      const error = new Error("Product Image is required");
      error.statusCode = 400;
      return next(error);
    }

    const { productname, description, price, category, countInStock } =
      req.body;

    if (
      !productname ||
      !description ||
      !price ||
      !category ||
      countInStock === undefined ||
      countInStock === null
    ) {
      const error = new Error("All fields are required.");
      error.statusCode = 400;
      return next(error);
    }

    const trimmedProductName = productname.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();

    if (isNaN(price) || Number(price) <= 0) {
      const error = new Error("Invalid price");
      error.statusCode = 400;
      return next(error);
    }

    if (isNaN(countInStock) || Number(countInStock) < 0) {
      const error = new Error("Invalid stock quantity");
      error.statusCode = 400;
      return next(error);
    }

    const existingProduct = await Product.findOne({
      productname: trimmedProductName,
    });

    if (existingProduct) {
      const error = new Error("Product with this name already exists.");
      error.statusCode = 400;
      return next(error);
    }

    const result = await uploadToCloudinary(image.buffer);

    const product = await Product.create({
      productname: trimmedProductName,
      description: trimmedDescription,
      price: Number(price),
      image: result.secure_url,
      imagePublicId: result.public_id,
      category: trimmedCategory,
      countInStock: Number(countInStock),
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Products
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Product
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Update Product
exports.updateProduct = async (req, res, next) => {
  try {
    const { productname, description, price, category, countInStock } =
      req.body;

    if (
      !productname ||
      !description ||
      !price ||
      !category ||
      countInStock === undefined ||
      countInStock === null
    ) {
      const error = new Error("All fields are required.");
      error.statusCode = 400;
      return next(error);
    }

    const trimmedProductName = productname.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();

    if (isNaN(price) || Number(price) <= 0) {
      const error = new Error("Invalid price");
      error.statusCode = 400;
      return next(error);
    }

    if (isNaN(countInStock) || Number(countInStock) < 0) {
      const error = new Error("Invalid stock quantity");
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error("Product not found.");
      error.statusCode = 404;
      return next(error);
    }

    const duplicate = await Product.findOne({
      productname: trimmedProductName,
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      const error = new Error("Product with this name already exists.");
      error.statusCode = 400;
      return next(error);
    }

    // update image if new file exists
    if (req.file) {
      await cloudinary.uploader.destroy(product.imagePublicId);

      const result = await uploadToCloudinary(req.file.buffer);

      product.image = result.secure_url;
      product.imagePublicId = result.public_id;
    }

    product.productname = trimmedProductName;
    product.description = trimmedDescription;
    product.price = Number(price);
    product.category = trimmedCategory;
    product.countInStock = Number(countInStock);

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      return next(error);
    }

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
