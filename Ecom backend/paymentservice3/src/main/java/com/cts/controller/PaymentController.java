package com.cts.controller;

import com.cts.dto.PaymentRequestDto;
import com.cts.dto.PaymentResponseDto;
import com.cts.entity.Payment;
import com.cts.exception.PaymentException;
import com.cts.service.PaymentService;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;

@RestController
//@CrossOrigin(origins = "*")
@RequestMapping("/payments")
public class PaymentController {

    private static final Logger logger = Logger.getLogger(PaymentController.class.getName());

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ModelMapper modelMapper;

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public PaymentResponseDto initiatePayment(@RequestBody PaymentRequestDto requestDto) {
        logger.info("Received request to initiate payment");
        return paymentService.initiatePayment(requestDto);
    }
    @PutMapping("/updatestatus/{paymentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> updatePaymentStatus(@PathVariable Long paymentId,
                                                      @RequestParam(defaultValue = "false") boolean cancel) {
        logger.info("Received request to update payment status for ID: " + paymentId + ", cancel: " + cancel);
        try {
            String status = paymentService.updatePaymentStatus(paymentId, cancel);
            return ResponseEntity.ok("Payment status updated to " + status + " for ID: " + paymentId);
        } catch (PaymentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred!");
        }
    }

    @GetMapping("/viewstatus/{paymentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> viewPaymentStatus(@PathVariable Long paymentId) {
        logger.info("Received request to view payment status for ID: " + paymentId);
        try {
            String statusResponse = paymentService.viewPaymentStatus(paymentId);
            return ResponseEntity.ok(statusResponse);
        } catch (PaymentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred!");
        }
    }

    @GetMapping("/details/{paymentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaymentResponseDto> getPaymentDetails(@PathVariable Long paymentId) {
        logger.info("Fetching full payment details for ID: " + paymentId);
        try {
            Payment payment = paymentService.getPaymentById(paymentId);
            PaymentResponseDto dto = modelMapper.map(payment, PaymentResponseDto.class);
            PaymentRequestDto dto1 = modelMapper.map(payment, PaymentRequestDto.class);
            dto.setUpiUri(paymentService.generateUpiUri(dto1));
            return ResponseEntity.ok(dto);
        } catch (PaymentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
