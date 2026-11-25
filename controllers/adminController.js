import User from "../models/User.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

const LOW_STOCK_LIMIT = 5;
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/stats
export const getStats = async (req, res) => {
  const [totalProducts, totalUsers, totalCustomers, outOfStock, lowStock, byFabric] =
    await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ stock: 0 }),
      Product.find({ stock: { $gt: 0, $lte: LOW_STOCK_LIMIT } })
        .select("name stock")
        .sort({ stock: 1 })
        .limit(10),
      Product.aggregate([
        { $group: { _id: "$fabric", count: { $sum: 1 }, totalStock: { $sum: "$stock" } } },
        { $sort: { count: -1 } },
      ]),
    ]);

  res.json({
    success: true,
    stats: { totalProducts, totalUsers, totalCustomers, outOfStock, lowStock, byFabric },
  });
};

// GET /api/admin/users?keyword=&role=&page=&limit=
export const getUsers = async (req, res) => {
  const { keyword, role } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const filter = {};
  if (role) filter.role = role;
  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), count: users.length, users });
};

// GET /api/admin/users/:id
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, user });
};

// PUT /api/admin/users/:id  { "role": "admin" | "customer" }
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["customer", "admin"].includes(role)) {
    throw new AppError("Role must be customer or admin", 400);
  }
  if (req.params.id === req.user.id) {
    throw new AppError("You cannot change your own role", 400);
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, user });
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new AppError("You cannot delete your own account here", 400);
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, message: "User deleted" });
};