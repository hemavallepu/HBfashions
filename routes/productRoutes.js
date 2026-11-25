import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { productUpload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", protect, authorizeRoles("admin"), productUpload, createProduct);
router.put("/:id", protect, authorizeRoles("admin"), productUpload, updateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);
router.delete("/:id/images/:imageId", protect, authorizeRoles("admin"), deleteProductImage);

export default router;