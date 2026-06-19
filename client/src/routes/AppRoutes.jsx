import { Routes, Route, Navigate } from "react-router-dom";

import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Dashboard from "../pages/dashboard/Dashboard";

import Customers from "../pages/people/Customers";
import Suppliers from "../pages/people/Suppliers";
import Employees from "../pages/people/Employees";

import UOM from "../pages/catalog/UOM";
import Category from "../pages/catalog/Category";
import Products from "../pages/catalog/Products";

import StockList from "../pages/stock/StockList";
import ReorderList from "../pages/stock/ReorderList";
import ExpiryList from "../pages/stock/ExpiryList";

import PurchaseList from "../pages/purchase/PurchaseList";
import AddPurchase from "../pages/purchase/AddPurchase";

import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />

          {/* People */}
          <Route path="people/customers" element={<Customers />} />
          <Route path="people/suppliers" element={<Suppliers />} />
          <Route path="people/employees" element={<Employees />} />

          {/* Catalog */}
          <Route path="catalog/uom" element={<UOM />} />
          <Route path="catalog/category" element={<Category />} />
          <Route path="catalog/products" element={<Products />} />

          {/* Stock */}
          <Route path="stock/list" element={<StockList />} />
          <Route path="stock/reorder" element={<ReorderList />} />
          <Route path="stock/expiry" element={<ExpiryList />} />

          {/* Purchases */}
          <Route path="purchase/list" element={<PurchaseList />} />
          <Route path="purchase/add" element={<AddPurchase />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
