import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Product from "./models/Product.js";

const img = (text) => [
  { public_id: text.toLowerCase(), url: `https://placehold.co/600x800?text=${encodeURIComponent(text)}` },
];

const sarees = [
  { name: "Red Kanjivaram Bridal Silk Saree", description: "Pure silk Kanjivaram saree with rich gold zari border, ideal for weddings.", price: 18500, discountPercent: 10, fabric: "Kanjivaram", occasion: "Bridal", color: "Red", stock: 8, images: img("Kanjivaram"), isFeatured: true, isBestSeller: true },
  { name: "Maroon Banarasi Party Wear Saree", description: "Rich Banarasi weave with intricate brocade work for evening occasions.", price: 12000, discountPercent: 15, fabric: "Banarasi", occasion: "Party Wear", color: "Maroon", stock: 10, images: img("Banarasi"), isTrending: true },
  { name: "Green Mysore Silk Festival Saree", description: "Soft Mysore silk saree with a simple gold border, great for festivals.", price: 6500, discountPercent: 5, fabric: "Mysore Silk", occasion: "Festival", color: "Green", stock: 15, images: img("Mysore Silk"), isFeatured: true },
  { name: "Yellow Cotton Daily Wear Saree", description: "Light and breathable cotton saree for everyday comfort.", price: 1200, discountPercent: 0, fabric: "Cotton", occasion: "Daily Wear", color: "Yellow", stock: 40, images: img("Cotton"), isBestSeller: true },
  { name: "Pink Organza Party Saree", description: "Sheer organza saree with floral embroidery for parties.", price: 3200, discountPercent: 20, fabric: "Organza", occasion: "Party Wear", color: "Pink", stock: 12, images: img("Organza"), isTrending: true },
  { name: "SkyBlue Chiffon Saree", description: "Flowy chiffon saree that drapes beautifully.", price: 2400, discountPercent: 10, fabric: "Chiffon", occasion: "Party Wear", color: "SkyBlue", stock: 5, images: img("Chiffon"), isFeatured: true },
  { name: "Black Georgette Office Wear Saree", description: "Elegant georgette saree with a minimal border, perfect for work.", price: 1800, discountPercent: 0, fabric: "Georgette", occasion: "Office Wear", color: "Black", stock: 20, images: img("Georgette") },
  { name: "Beige Linen Office Wear Saree", description: "Smooth linen saree with a natural texture for a professional look.", price: 2800, discountPercent: 5, fabric: "Linen", occasion: "Office Wear", color: "Beige", stock: 18, images: img("Linen"), isTrending: true },
  { name: "Gold Kanjivaram Festival Saree", description: "Traditional Kanjivaram with temple border for festive celebrations.", price: 15000, discountPercent: 12, fabric: "Kanjivaram", occasion: "Festival", color: "Gold", stock: 6, images: img("Kanjivaram Gold"), isBestSeller: true },
  { name: "Purple Banarasi Bridal Saree", description: "Heavy Banarasi silk with zari work, made for bridal wear.", price: 22000, discountPercent: 8, fabric: "Banarasi", occasion: "Bridal", color: "Purple", stock: 4, images: img("Banarasi Bridal"), isFeatured: true },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany();
    await Product.insertMany(sarees);
    console.log(`Seeded ${sarees.length} sarees`);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }
};

seed();