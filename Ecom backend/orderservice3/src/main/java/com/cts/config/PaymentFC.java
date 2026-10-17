package com.cts.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.cts.dto.PaymentRequestDto;
import com.cts.dto.PaymentResponseDto;


import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name="payment", configuration = FeignClientConfig.class)
public interface PaymentFC {
	
	@PostMapping("/payments/initiate")
    public PaymentResponseDto initiatePayment(@RequestBody PaymentRequestDto requestDto);

    @PutMapping("/payments/updatestatus/{paymentId}")
    public ResponseEntity<String> updatePaymentStatus(@PathVariable Long paymentId,@RequestParam(defaultValue = "false") boolean cancel);
    
    @GetMapping("/payments/viewstatus/{paymentId}")
    public ResponseEntity<String> viewPaymentStatus(@PathVariable Long paymentId);
	
	

}
