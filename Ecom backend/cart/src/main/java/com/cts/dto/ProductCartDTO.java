package com.cts.dto;

import lombok.Data;

@Data
public class ProductCartDTO {

	private int productID;
	private String name;
	private double price;

	public ProductCartDTO(int productID, String name, double price) {
		this.productID = productID;
		this.name = name;
		this.price = price;
	}

	// Getters and Setters
	public int getProductID() {
		return productID;
	}

	public String getProductName() {
		return name;
	}

	public double getProductPrice() {
		return price;
	}

	public void setProductId(int productId) {
		this.productID = productId;
	}

	public void setProductName(String productName) {
		this.name = productName;
	}

	public void setProductPrice(double productPrice) {
		this.price = productPrice;
	}
}
