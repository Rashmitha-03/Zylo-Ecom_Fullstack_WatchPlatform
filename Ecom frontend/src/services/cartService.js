// services/cartService.js
import api from '../../src/api'; // adjust the path as needed

// Cart routes via API Gateway proxy
export const fetchCartItems = (userId) =>
  api.get(`/api/v1/cart/${userId}/viewAllProductsFromCart`);

export const fetchTotalPrice = (userId) =>
  api.get(`/api/v1/cart/${userId}/total-priceOfCart`);

export const increaseQuantity = (userId, productId, qty) =>
  api.put(`/api/v1/cart/${userId}/increaseCartQuantity/${productId}?quantityToAdd=${qty}`);

export const decreaseQuantity = (userId, productId, qty) =>
  api.put(`/api/v1/cart/${userId}/decreaseCartQuantity/${productId}?quantityToRemove=${qty}`);

export const removeItem = (userId, productId) =>
  api.delete(`/api/v1/cart/${userId}/removeFromCart/${productId}`);

export const clearCart = (userId) =>
  api.delete(`/api/v1/cart/${userId}/clearFromCart`);

export const fetchProductImage = async (productId) => {
  const res = await api.get(`/api/ecom/getProductById/${productId}`);
  return res.data.imageURL;
};

export const fetchStockAvailability = async (productId) => {
  const res = await api.get(`/api/ecom/products/getStockAvailability`, {
    params: { productId },
  });
  return res.data.availableStock;
};

