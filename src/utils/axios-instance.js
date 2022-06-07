import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

console.log(axiosInstance.baseURL, "sadasdasdas");

export default axiosInstance;
