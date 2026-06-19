import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.email.trim() || !formData.password.trim()) {
        return toast.error("Enter email and password");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        return toast.error("Invalid email format");
      }

      const res = await api.post("/auth/login", formData);

      const { accessToken, refreshToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      toast.success("Login successful");

      navigate("/dashboard",{replace:true});
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      sideTitle="New Here?"
      sideText="Create an account and start your journey."
      sideButtonText="Sign Up"
      sideButtonLink="/signup"
      showSocial={true}
      showEmailText={true}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
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

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-md text-orange-500 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-full bg-orange-500 text-white font-semibold tracking-wide hover:bg-orange-500 hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer"
        >
          Login
        </button>
      </form>
    </AuthLayout>
  );
}
