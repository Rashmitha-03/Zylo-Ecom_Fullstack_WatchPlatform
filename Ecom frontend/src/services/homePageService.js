// services/productService.js
import api from '../../src/api'; // adjust the path if needed

export const getProductById = (id) => {
  return api.get(`/api/ecom/getProductById/${id}`);
};