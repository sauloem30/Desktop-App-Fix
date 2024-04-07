import axios from "axios";
import moment from "moment";
import { getFromStore } from "./electronApi";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async config => {
    // Do something before request is sent
    const token = await getFromStore("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Add utc offset to headers
      config.headers["utc_offset"] = moment().utcOffset();
    }
    return config;
  }
);

export default axiosInstance;