// AUTH CONTROLLER — only HTTP handling

import {
  registerService,
  verifyOtpService,
  loginService,
  resendOtpService,
  forgotPasswordService,
  resetPasswordService,
  refreshTokenService,
} from "../services/authService.js";

// REGISTER
export const register = async (req, res, next) => {
  try {
    const result = await registerService(req.body);

    if (result.otpPending) {
      return res.status(200).json({
        message: "OTP already pending. New OTP sent.",
        goToOtp: true,
        email: result.email,
      });
    }

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    next(error);
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res, next) => {
  try {
    await verifyOtpService(req.body);
    res.json({ message: "Account verified successfully" });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const result = await loginService(req.body);
    res.json({ message: "Login successful", ...result });
  } catch (error) {
    next(error);
  }
};

// RESEND OTP
export const resendOtp = async (req, res, next) => {
  try {
    await resendOtpService(req.body);
    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    next(error);
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  try {
    await forgotPasswordService(req.body);
    res.json({ message: "Reset link sent" });
  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordService({ token: req.params.token, ...req.body });
    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res, next) => {
  try {
    const result = await refreshTokenService(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};