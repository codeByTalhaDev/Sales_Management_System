import axiosInstance from "../../api/axios";

const request = async (method, url, data = null, config = {}) => {
  const response = await axiosInstance({
    method,
    url,
    data,
    ...config,
  });

  return response.data;
};

export const get = (url, config) =>
  request("get", url, null, config);

export const post = (url, data, config) =>
  request("post", url, data, config);

export const put = (url, data, config) =>
  request("put", url, data, config);

export const remove = (url, config) =>
  request("delete", url, null, config);