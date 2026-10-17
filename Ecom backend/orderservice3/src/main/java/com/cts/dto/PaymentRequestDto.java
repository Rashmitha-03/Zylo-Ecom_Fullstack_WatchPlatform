package com.cts.dto;

import lombok.Data;

@Data
public class PaymentRequestDto {
	private Long paymentId;
	private String upiId;
	//private String name;
	private double amount;

}
