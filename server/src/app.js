import express from "express";
import cors from "cors";
import path from "path";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import uomRoutes from "./routes/uomRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

// ERROR MIDDLEWARE
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// ─── MIDDLEWARES ───────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FILES (UPLOADED IMAGES) ────────────────────
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ─── ROUTES ────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/customers",  customerRoutes);
app.use("/api/suppliers",  supplierRoutes);
app.use("/api/employees",  employeeRoutes);
app.use("/api/uoms",       uomRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/stock",      stockRoutes);
app.use("/api/purchases",  purchaseRoutes);

// ─── ERROR HANDLERS ────────────────────────────────────
app.use(notFound);      // 404 — unknown routes
app.use(errorHandler);  // 500 — all other errors

export default app;