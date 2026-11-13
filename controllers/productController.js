import mongoose from "mongoose";
import Product from "../models/Product.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/products  (admin only later)
export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
};

// GET /api/products?keyword=&fabric=&occasion=&color=&minPrice=&maxPrice=&sort=&page=&limit=
export const getProducts = async (req, res) => {
  const { keyword, fabric, occasion, color, minPrice, maxPrice, sort, featured, trending, bestSeller } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const filter = {};

  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }
  // comma-separated allowed: ?fabric=Cotton,Linen
  if (fabric) filter.fabric = { $in: fabric.split(",") };
  if (occasion) filter.occasion = { $in: occasion.split(",") };
  if (color) filter.color = new RegExp(`^${escapeRegex(color)}$`, "i");

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (featured === "true") filter.isFeatured = true;
  if (trending === "true") filter.isTrending = true;
  if (bestSeller === "true") filter.isBestSeller = true;

  const sortOptions = {
    newest: { createdAt: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    rating: { ratings: -1 },
  };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    count: products.length,
    products,
  });
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, product });
};

// PUT /api/products/:id  (admin only later)
export const updateProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, product });
};

// DELETE /api/products/:id  (admin only later)
export const deleteProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, message: "Product deleted" });
};