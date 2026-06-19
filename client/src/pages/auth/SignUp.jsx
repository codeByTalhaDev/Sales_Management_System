import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function SignUp() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // REMOVE EXTRA SPACES
    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    // EMPTY FIELD VALIDATION
    if (!fullName || !email || !password) {
      return toast.error("All fields are required");
    }

    // EMAIL SPACE VALIDATION
    if (email.includes(" ")) {
      return toast.error("Email cannot contain spaces");
    }

    // EMAIL FORMAT VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return toast.error("Invalid email format");
    }

    // PASSWORD VALIDATION
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        fullName,
        email,
        password,
      });

      toast.success(res.data.message || "OTP sent to your email");

      navigate("/verify-otp", {
        state: {
          email,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      sideTitle="Welcome Back!"
      sideText="Already have an account? Login now."
      sideButtonText="Sign In"
      sideButtonLink="/login"
      showSocial={false}
      showEmailText={false}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <FormInput
          type="text"
          placeholder="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />

        <FormInput
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <FormInput
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-orange-500 text-white font-semibold tracking-wide hover:bg-orange-600 hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </AuthLayout>
  );
}
