
import api from '../api';

export const getAddressesByUser = (userId) => api.get(`/api/addresses/${userId}`);
export const getAddressesByAddressId = (addressId) => api.get(`/api/addresses/address/${addressId}`);

export const getPaymentDetails = (paymentId) => api.get(`/payments/details/${paymentId}`);
// Updated to use both userId and paymentId in path
    
export const getProductById = (id) => api.get(`/api/ecom/getProductById/${id}`);
export const getProductStockAvailability = (productId) =>api.get(`/api/ecom/products/getStockAvailability?productId=${productId}`);

export const getOrderDetails = (userId,orderId) => api.get(`/orders/search/${userId}/${orderId}`);

export const startPayment = (orderDTO) => api.post('/orders/online-payment/start', orderDTO);
export const finalizeOrder = (paymentId) => api.post(`/orders/online-payment/finalize?paymentId=${paymentId}`);
export const placeCashOnDelivery = (userId, offlineDTO) => api.post(`/orders/cash-on-delivery/${userId}`, offlineDTO);

export function updatePaymentStatus(paymentId, cancel) {
    return api.put(`/payments/updatestatus/${paymentId}`, null, {
      params: { cancel },
    });
  }
    

export const placeOrderFromCartCashOnDelivery = (userId, addressId) =>api.post(`/orders/cart/cash-delivery/${userId}?addressId=${addressId}`);
export const startCartOnlinePayment = (cartOnlineDTO) =>api.post('/orders/cart/online/start', cartOnlineDTO);
export const finalizeCartOnlineOrder = (paymentId) =>api.post(`/orders/cart/online/finalize/${paymentId}`);

export const increaseProductQuantity = (userId, productId, quantityToAdd) =>api.put(`/api/v1/cart/${userId}/increaseCartQuantity/${productId}?quantityToAdd=${quantityToAdd}`);
export const decreaseProductQuantity = (userId, productId, quantityToRemove) =>api.put(`/api/v1/cart/${userId}/decreaseCartQuantity/${productId}?quantityToRemove=${quantityToRemove}`);
export const removeProductFromCart = (userId, productId) =>api.delete(`/api/v1/cart/${userId}/removeFromCart/${productId}`);

export const getCartByUserId = (userId) => api.get(`/api/v1/cart/${userId}/viewAllProductsFromCart`);


