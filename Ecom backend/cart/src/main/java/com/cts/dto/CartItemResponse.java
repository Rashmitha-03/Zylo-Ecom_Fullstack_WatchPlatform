package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartItemResponse {
	private String productname;
	private double productprice;
	private int quantity;
	private double subtotal;
}


