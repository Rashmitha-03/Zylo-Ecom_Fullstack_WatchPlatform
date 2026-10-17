package com.cts.dto;

import lombok.Data;

@Data
public class CartItemDTO {
	private Integer id;
	private Integer productId;
//    private String productName;
//    private double productPrice;
	private int quantity;

	public CartItemDTO() {

	}

	public CartItemDTO(Integer productId, String productName, double productPrice, int quantity) {
		this.productId = productId;
//        this.productName = productName;
//        this.productPrice = productPrice;
		this.quantity = quantity;
	}
	
	public CartItemDTO(Integer productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    // Getters and Setters
    public Integer getProductId() { return productId; }
    public Integer getQuantity() { return quantity; }
    

}
