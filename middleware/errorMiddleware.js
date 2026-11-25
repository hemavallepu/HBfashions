export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  }
  if (err.code === 11000) {
    status = 400;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token, please login again";
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Session expired, please login again";
  }
  if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 20 MB)" : err.message;
  }

  res.status(status).json({ success: false, message });
};