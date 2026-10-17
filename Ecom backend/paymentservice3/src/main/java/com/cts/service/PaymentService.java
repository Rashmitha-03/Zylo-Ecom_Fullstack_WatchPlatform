package com.cts.service;

import com.cts.dto.PaymentRequestDto;
import com.cts.dto.PaymentResponseDto;
import com.cts.entity.Payment;

public interface PaymentService {
    PaymentResponseDto initiatePayment(PaymentRequestDto requestDto);
    String updatePaymentStatus(Long paymentId, boolean isCancelled);
    String viewPaymentStatus(Long paymentId);
	Payment getPaymentById(Long paymentId);
	 String generateUpiUri(PaymentRequestDto dto);


}
