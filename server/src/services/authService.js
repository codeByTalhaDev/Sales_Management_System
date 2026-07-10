// AUTH SERVICE — all business logic & DB queries

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

// OTP EMAIL TEMPLATE
const otpEmailTemplate = (otp) => `
  <div style="font-family: Arial;">
    <h2>OTP Verification</h2>
    <p>Your OTP code is:</p>
    <h1 style="color:#f97316">${otp}</h1>
    <p>This OTP expires in 5 minutes.</p>
  </div>
`;

// REGISTER
export const registerService = async (data) => {
  console.log("STEP 1 - registerService called");

  const { fullName, email, password } = data;

  console.log("STEP 2 - Data received:", {
    fullName,
    email,
  });

  const userExists = await User.findOne({ where: { email } });

  console.log("STEP 3 - User lookup completed");

  if (userExists) {
    console.log("STEP 4 - User already exists");

    if (!userExists.isVerified) {
      console.log("STEP 5 - User not verified");

      const otp = generateOtp();

      userExists.otp = otp;
      userExists.otpExpiry = Date.now() + 5 * 60 * 1000;

      await userExists.save();

      console.log("STEP 6 - OTP saved");

      await sendEmail(
        email,
        "OTP Verification Code",
        otpEmailTemplate(otp)
      );

      console.log("STEP 7 - Email sent");

      return {
        otpPending: true,
        email,
      };
    }

    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  console.log("STEP 8 - Creating new user");

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("STEP 9 - Password hashed");

  const otp = generateOtp();

  console.log("STEP 10 - OTP generated");

  await User.create({
    fullName,
    email,
    password: hashedPassword,
    otp,
    otpExpiry: Date.now() + 5 * 60 * 1000,
    isVerified: false,
  });

  console.log("STEP 11 - User created");

  await sendEmail(
    email,
    "OTP Verification Code",
    otpEmailTemplate(otp)
  );

  console.log("STEP 12 - Email sent successfully");

  return {
    otpSent: true,
  };
};

// VERIFY OTP
export const verifyOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.otp !== otp) {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  if (user.otpExpiry < Date.now()) {
    const error = new Error("OTP expired");
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();
};

// LOGIN
export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error("Verify OTP first");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return { accessToken, refreshToken, user };
};

// RESEND OTP
export const resendOtpService = async ({ email }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail(email, "OTP Verification Code", otpEmailTemplate(otp));
};

// FORGOT PASSWORD
export const forgotPasswordService = async ({ email }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  await sendEmail(
    email,
    "Reset Your Password",
    `
    <div style="font-family:Arial">
      <h2>Password Reset</h2>
      <p>Click below:</p>
      <a href="${resetLink}" style="background:#f97316;color:white;padding:12px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
        Reset Password
      </a>
      <p>Expires in 10 minutes.</p>
    </div>
    `
  );
};

// RESET PASSWORD
export const resetPasswordService = async ({ token, password }) => {
  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiry: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();
};

// REFRESH TOKEN
export const refreshTokenService = async ({ refreshToken }) => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  const newAccessToken = generateAccessToken(decoded.id);
  return { accessToken: newAccessToken };
};