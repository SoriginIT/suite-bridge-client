import axios from 'axios';
import { env } from '../config/config.js';

const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: add request/response interceptors here later
// api.interceptors.request.use(...)
// api.interceptors.response.use(...)

export default api;
