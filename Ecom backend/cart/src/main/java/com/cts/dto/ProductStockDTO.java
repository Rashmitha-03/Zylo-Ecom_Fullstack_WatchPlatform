package com.cts.dto;

import lombok.Data;

@Data
public class ProductStockDTO {
	private int productId;
	private int availableStock;

	public ProductStockDTO(Integer productId, int availableStock) {
		this.productId = productId;
		this.availableStock = availableStock;
	}

	// Getters and Setters
	public int getProductId() {
		return productId;
	}

	public int getAvailableStock() {
		return availableStock;
	}

	public void setProductId(Integer productId) {
		this.productId = productId;
	}

	public void setAvailableStock(int availableStock) {
		this.availableStock = availableStock;
	}
}
