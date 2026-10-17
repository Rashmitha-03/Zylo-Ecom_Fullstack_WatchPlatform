import api from '../api';

const ORDER_API = '/orders';
const PRODUCT_API = '/api/ecom'; // Gateway will forward to product-service

export const submitFeedback = (productId, feedback) =>
  api.post(`${PRODUCT_API}/products/${productId}/addFeedback`, feedback);

export const fetchOrdersByUser = (userId) =>
  api.get(`${ORDER_API}/user/${userId}`);

export const fetchAllProducts = () =>
  api.get(`${PRODUCT_API}/getAllProducts`);

export const fetchUserOrders = (userId) =>
  api.get(`${ORDER_API}/user/${userId}`);

export const cancelOrder = (userId, orderId) => {
  const token = localStorage.getItem("token");
  return api.post(`${ORDER_API}/cancel/${userId}/${orderId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};


export const returnProduct = ({ userId, orderId, productId, quantity, upiId }) => {
  const token = localStorage.getItem("token");
  return api.post(`${ORDER_API}/return/${userId}/${orderId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: { productId, quantity, upiId }
  });
};

export const replaceProduct = ({ userId, orderId, productId, quantity, upiId }) => {
  const token = localStorage.getItem("token");
  return api.put(`${ORDER_API}/replace/${userId}/${orderId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: { productId, quantity, upiId }
  });
};


export const fetchAddressById = (addressId) =>
  api.get(`/api/addresses/address/${addressId}`);

