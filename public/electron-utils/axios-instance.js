const axios = require('axios');
const moment = require('moment');
const { SecretsStore } = require('./store');
const isDev = require('electron-is-dev');

const axiosInstance = axios.create();

const getAxios = async () => {
  const baseUrl = await SecretsStore.get("baseUrl");
  axiosInstance.defaults.baseURL = isDev ? `http://localhost:4301/api` : baseUrl;

  // Add a request interceptor
  axiosInstance.interceptors.request.use(
    async config => {
      // Do something before request is sent
      const token = await SecretsStore.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Add utc offset to headers
        config.headers["utc_offset"] = moment().utcOffset();
      }
      return config;
    }
  );

  return axiosInstance;
}

module.exports = { getAxios };