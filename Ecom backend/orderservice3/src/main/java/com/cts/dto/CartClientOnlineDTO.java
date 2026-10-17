package com.cts.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
@Data
public class CartClientOnlineDTO {
	
	 private int userId;
	 private String upiId;
	 
	    private String orderId;
	    
		@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	    private List<CartItemDTO> items;
		
		@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	    private double totalPrice;
		
	    private int addressId;
}
