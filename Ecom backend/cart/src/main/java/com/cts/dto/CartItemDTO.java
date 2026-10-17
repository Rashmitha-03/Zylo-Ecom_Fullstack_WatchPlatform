package com.cts.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CartItemDTO {
	private int id;
	private int productId;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private String productName;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private double productPrice;
	private int quantity;

	public CartItemDTO(int productId, String productName, double productPrice, int quantity) {
		this.productId = productId;
		this.productName = productName;
		this.productPrice = productPrice;
		this.quantity = quantity;
	}

	public CartItemDTO(int productId, int quantity) {
		this.productId = productId;
		this.quantity = quantity;
	}

	// Getters and Setters
	public Integer getProductId() {
		return productId;
	}

	public Integer getQuantity() {
		return quantity;
	}

}
