import api from "./axios";

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  const res = await api.post("/refresh-token", {
    refreshToken,
  });

  return res.data.accessToken;
};