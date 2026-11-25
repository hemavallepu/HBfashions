import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";


const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "HB Fashion API is running" });
});
app.use("/api/auth", authRoutes);       
app.use("/api/products", productRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler); 

export default app;