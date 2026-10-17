package com.cts.dto;



import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class OrderDTO {

	private String orderId;
	private int userId;
	private int productId; // Add this field
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private String productName;
	
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private String orderStatus;
	//private String paymentMethod;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)

	private Long paymentId;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)

	private String paymentStatus;
	//private LocalDateTime orderTime;
	private int quantity;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)

	private double totalPrice;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private double orderAmount;
	//private String refundStatus;
	private int addressId; // For existing address
	
	private String upiId;
	

	

}


