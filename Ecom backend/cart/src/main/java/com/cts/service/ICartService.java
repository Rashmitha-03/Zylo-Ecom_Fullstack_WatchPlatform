package com.cts.service;

import java.util.List;

import com.cts.dto.CartDTO;
import com.cts.dto.CartItemDTO;
import com.cts.dto.CartSummaryResponse;

public interface ICartService {
	CartDTO addProductToCart(int userId, CartItemDTO cartItemDto);

	CartDTO increaseProductQuantity(int userId, int productId, int quantityToAdd);

	CartDTO decreaseProductQuantity(int userId, int productId, int quantityToRemove);

	void removeProductFromCart(int userId, int productId);

	void clearCart(int userId);

	double calculateTotalPrice(int userId);

	CartDTO createCartForUser(int userId);

	double getTotalPriceForCart(int userId);

	List<CartItemDTO> getCartItems(int userId);

	CartSummaryResponse getCartBreakdownForUser(int userId);

	void updateGrandTotal(int userId, Double grandTotal);

}
