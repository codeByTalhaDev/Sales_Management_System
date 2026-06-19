import express from "express";
import {
  register,
  verifyOtp,
  login,
  resendOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
} from "../controllers/authController.js";
import {
  validateRegister,
  validateVerifyOtp,
  validateLogin,
  validateResendOtp,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
} from "../validators/authValidator.js";

const router = express.Router();

router.post("/register",        validateRegister,       register);
router.post("/verify-otp",      validateVerifyOtp,      verifyOtp);
router.post("/login",           validateLogin,          login);
router.post("/resend-otp",      validateResendOtp,      resendOtp);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password/:token", validateResetPassword, resetPassword);
router.post("/refresh-token",   validateRefreshToken,   refreshToken);

export default router;