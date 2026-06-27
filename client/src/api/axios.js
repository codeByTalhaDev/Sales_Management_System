import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// ATTACH ACCESS TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.authorization = token;
  }

  return config;
});

export default api;
