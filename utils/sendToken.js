const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  const isProd = process.env.NODE_ENV === "production";

  const options = {
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE_DAYS) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export default sendToken;