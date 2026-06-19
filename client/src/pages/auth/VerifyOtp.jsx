import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // ✅ SAFE REDIRECT
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ VERIFY OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const otpCode = otp.join("");

      const res = await api.post("/auth/verify-otp", {
        email,
        otp: otpCode,
      });

      toast.success(res.data.message || "Account verified");

      navigate("/login");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  };

  // ✅ RESEND OTP
  const handleResendOtp = async () => {
    try {
      const res = await api.post("/auth/resend-otp", {
        email,
      });

      toast.success(res.data.message || "OTP resent successfully");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend OTP"
      );
    }
  };

  return (
    <AuthLayout
      title="Verify OTP"
      sideTitle="Almost There!"
      sideText="Enter the verification code sent to your email."
      sideButtonText="Back To Login"
      sideButtonLink="/login"
      showSocial={false}
      showEmailText={false}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-8 px-4 sm:px-0"
      >
        {/* OTP BOXES */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-orange-400"
            />
          ))}
        </div>

        {/* RESEND */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-orange-500 font-medium hover:text-orange-600 cursor-pointer"
          >
            Resend OTP
          </button>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition cursor-pointer"
        >
          Verify OTP
        </button>
      </form>
    </AuthLayout>
  );
}