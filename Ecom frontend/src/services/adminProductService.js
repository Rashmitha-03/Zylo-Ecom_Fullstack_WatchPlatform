// src/services/adminProductService.js
import api from '../api';

export const getAllAdminProducts = () =>
  api.get('/api/ecom/admin/getAllProductsforAdmin'); 
export const addProduct = (data) => api.post('/api/ecom/addProduct', data);
export const updateProduct = (id, data) =>
  api.put(`/api/ecom/updateProduct/${id}`, data);
export const deleteProduct = (id) =>
  api.delete(`/api/ecom/deleteProduct/${id}`);
export const softDeleteProduct = (id) =>
  api.put(`/api/ecom/products/${id}/soft-delete`);
export const restoreProduct = (id) =>
  api.put(`/api/ecom/products/${id}/restoreProduct`);

