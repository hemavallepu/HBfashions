import mongoose from "mongoose";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const uploadFiles = async (files = {}) => {
  const images = await Promise.all(
    (files.images || []).map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, { resource_type: "image" });
      return { public_id: result.public_id, url: result.secure_url };
    })
  );

  let video;
  if (files.video?.[0]) {
    const result = await uploadToCloudinary(files.video[0].buffer, { resource_type: "video" });
    video = { public_id: result.public_id, url: result.secure_url };
  }
  return { images, video };
};

const removeFiles = async (images = [], video) => {
  await Promise.all(images.map((img) => deleteFromCloudinary(img.public_id)));
  if (video?.public_id) await deleteFromCloudinary(video.public_id, "video");
};

// POST /api/products  (admin only) - multipart/form-data
export const createProduct = async (req, res) => {
  const { images, video } = await uploadFiles(req.files);
  try {
    const product = await Product.create({ ...req.body, images, video });
    res.status(201).json({ success: true, product });
  } catch (error) {
    await removeFiles(images, video); // don't leave orphan files in Cloudinary
    throw error;
  }
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

// PUT /api/products/:id  (admin only)
export const updateProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const fields = { ...req.body };
  delete fields.images; // files are handled separately below
  delete fields.video;

  const { images, video } = await uploadFiles(req.files);

  product.set(fields);
  if (images.length) product.images.push(...images);
  if (video) {
    if (product.video?.public_id) await deleteFromCloudinary(product.video.public_id, "video");
    product.video = video;
  }
  await product.save();

  res.json({ success: true, product });
};

// DELETE /api/products/:id  (admin only)
export const deleteProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  await removeFiles(product.images, product.video);
  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
};

// DELETE /api/products/:id/images/:imageId  (admin only)
export const deleteProductImage = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);

  const image = product.images.id(req.params.imageId);
  if (!image) throw new AppError("Image not found", 404);

  await deleteFromCloudinary(image.public_id);
  product.images.pull(image._id);
  await product.save();

  res.json({ success: true, product });
};