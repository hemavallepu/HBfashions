import express from "express";
import {
  getStats,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.route("/users/:id").get(getUserById).put(updateUserRole).delete(deleteUser);

export default router;