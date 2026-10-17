package com.cts.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartSummaryResponse {
	private List<CartItemResponse> items;
	private double totalPrice;

}
