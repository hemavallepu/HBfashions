import mongoose from "mongoose";

export const FABRICS = [
  "Kanjivaram", "Banarasi", "Mysore Silk", "Cotton",
  "Organza", "Chiffon", "Georgette", "Linen",
];

export const OCCASIONS = [
  "Party Wear", "Bridal", "Office Wear", "Daily Wear", "Festival",
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    fabric: { type: String, required: true, enum: FABRICS },
    occasion: { type: String, required: true, enum: OCCASIONS },
    color: { type: String, required: true, trim: true },
    images: [
      {
        public_id: { type: String },
        url: { type: String, required: true },
      },
    ],
    video: { public_id: { type: String }, url: { type: String } },
    stock: { type: Number, required: true, min: 0, default: 0 },
    deliveryDays: { type: Number, default: 5 },
    ratings: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Final price after discount (calculated, not stored)
productSchema.virtual("finalPrice").get(function () {
  return Math.round(this.price - (this.price * this.discountPercent) / 100);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);