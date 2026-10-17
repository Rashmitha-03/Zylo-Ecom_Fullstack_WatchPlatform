// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8003', // Your Gateway
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');

  const isPublicRoute =
  config.url === '/api/ecom/getAllProducts' ||
  config.url.startsWith('/api/ecom/filter') ||
  config.url.match(/^\/api\/ecom\/getProductById\/\d+$/) ||
  config.url.startsWith('/api/ecom/products/getProductForCart') ||
  config.url.startsWith('/api/ecom/products/getStockAvailability') ||
  config.url.startsWith('/api/ecom/products/getSummaries') ||
  config.url.match(/^\/api\/ecom\/products\/\d+\/getFeedbackByProduct$/);

  if (!isPublicRoute && token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
}, Promise.reject);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwtToken');
      // Optionally redirect
    }
    return Promise.reject(error);
  }
);

export default api;
