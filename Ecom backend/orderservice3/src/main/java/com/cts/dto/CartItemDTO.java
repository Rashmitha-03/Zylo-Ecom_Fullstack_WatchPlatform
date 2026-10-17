package com.cts.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public  class CartItemDTO{
	private int id;
	private int productId;
	private int quantity;
	
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private String status;

}