package com.cts.dto;

import java.util.List;

import lombok.Data;

@Data
public class CartDTO {
	private int cartId;
    private int userId;
    private List<CartItemDTO> cartItems;
    private double totalPrice;
}
