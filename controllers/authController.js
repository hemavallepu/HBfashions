import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import sendToken from "../utils/sendToken.js";

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password } = req.body; // role is NOT taken from the body
  const user = await User.create({ name, email, password });
  sendToken(user, 201, res);
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Please enter email and password", 400);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }
  sendToken(user, 200, res);
};

// GET /api/auth/logout
export const logout = async (req, res) => {
  res.cookie("token", "", { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: "Logged out" });
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};