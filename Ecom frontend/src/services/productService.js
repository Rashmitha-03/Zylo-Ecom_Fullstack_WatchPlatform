// services/productService.js
import api from '../api';

export const getAllPublicProducts = () =>
  api.get('/api/ecom/getAllProducts');

export const getFilteredProducts = (filters) =>
  api.get(`/api/ecom/filter`, { params: filters });

export const addToCart = (userId, productId, quantity = 1) =>
  api.post(`/api/v1/cart/${userId}/addToCart`, { productId, quantity });
