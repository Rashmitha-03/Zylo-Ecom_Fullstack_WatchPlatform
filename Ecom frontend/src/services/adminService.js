import api from '../api';

const USER_API = '/api/v1/users'; // Gateway handles routing
const ORDER_API = '/orders';   // Gateway path to order-service
const PRODUCT_API = '/api/ecom'; 

export const fetchAllUsers = () =>
  api.get(`${USER_API}`);

export const fetchOrdersByUserId = (userId) =>
  api.get(`${ORDER_API}/user/${userId}`);

export const markOrderAsDelivered = (orderId) =>
  api.put(`${ORDER_API}/admin/deliver/${orderId}`);

export const fetchProductFrequencyStats = () =>
  api.get(`${ORDER_API}/report/product-frequency`);


export const getProductById = (id) =>
  api.get(`${PRODUCT_API}/getProductById/${id}`);

export const fetchGenderFrequencyStats = () =>
  api.get(`${ORDER_API}/stats/gender-frequency`);

