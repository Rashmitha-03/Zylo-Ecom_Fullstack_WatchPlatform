package com.cts.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentResponseDto {
    private Long paymentId;
    private String upiUri;
    private LocalDateTime createdAt;
    private String status;
    private String upiId;
  
    private double amount;    
}
