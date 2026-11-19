import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
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

// POST /api/auth/password/forgot
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError("Please enter your email", 400);

  const genericMessage = "If that email is registered, a reset link has been sent";

  const user = await User.findOne({ email });
  if (!user) return res.json({ success: true, message: genericMessage });

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/password/reset/${resetToken}`;

  if (process.env.NODE_ENV === "development") {
    console.log("Reset link (dev only):", resetUrl);
  }

  try {
    await sendEmail({
      to: user.email,
      subject: "HB Fashion - Reset your password",
      text: `Open this link to reset your password (valid for 15 minutes): ${resetUrl}`,
      html: `<p>Click the link below to reset your password. It is valid for 15 minutes.</p>
             <p><a href="${resetUrl}">Reset password</a></p>
             <p>If you did not request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("Email could not be sent, please try again later", 500);
  }

  res.json({ success: true, message: genericMessage });
};

// PUT /api/auth/password/reset/:token
export const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) throw new AppError("Please enter and confirm your new password", 400);
  if (password !== confirmPassword) throw new AppError("Passwords do not match", 400);

  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) throw new AppError("Reset link is invalid or has expired", 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, res);
};

// PUT /api/auth/password/update  (logged-in users)
export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) throw new AppError("Please enter old and new password", 400);

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(oldPassword))) {
    throw new AppError("Old password is incorrect", 400);
  }

  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
};