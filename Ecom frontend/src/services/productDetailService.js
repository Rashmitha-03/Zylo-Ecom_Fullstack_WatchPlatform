// services/productDetailService.js
import api from '../api';

export const getProductById = (id) =>
  api.get(`/api/ecom/getProductById/${id}`);

export const getFeedbackByProduct = (id) =>
  api.get(`/api/ecom/products/${id}/getFeedbackByProduct`);

export const getStockAvailability = (productId) =>
  api.get(`/api/ecom/products/getStockAvailability`, {
    params: { productId }
  });

export const addToCart = (userId, productId, quantity) =>
  api.post(`/api/v1/cart/${userId}/addToCart`, {
    productId,
    quantity
  });
