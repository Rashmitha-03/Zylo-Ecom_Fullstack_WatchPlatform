package com.cts.dto;


import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class OfflineDTO {
	
	private String orderId;
	private int userId;
	private int productId; // Add this field
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private String productName;
//	private String orderStatus;
	//private String paymentMethod;
//	private Long paymentId;
//	private String paymentStatus;
	//private LocalDateTime orderTime;
	private int quantity;
	//private double totalPrice;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private double orderAmount;
	//private String refundStatus;
	private int addressId; // For existing address
	

}
