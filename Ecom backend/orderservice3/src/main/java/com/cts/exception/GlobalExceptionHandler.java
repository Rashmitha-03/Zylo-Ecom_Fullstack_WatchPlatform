package com.cts.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFound(UserNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AddressNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleAddressNotFound(AddressNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Address not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleProductNotFound(ProductNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Product not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientStockException(InsufficientStockException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Insufficient stock available");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleOrderNotFoundException(OrderNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Order not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(OrderCancellationException.class)
    public ResponseEntity<Map<String, String>> handleOrderCancellationException(OrderCancellationException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Order cannot be cancelled");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(OrderReturnException.class)
    public ResponseEntity<Map<String, String>> handleOrderReturnException(OrderReturnException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Order return failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(OrderReplacementException.class)
    public ResponseEntity<Map<String, String>> handleOrderReplacementException(OrderReplacementException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Order replacement failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(PaymentInitiationException.class)
    public ResponseEntity<Map<String, String>> handlePaymentInitiationException(PaymentInitiationException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Payment initiation failed");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(CartEmptyException.class)
    public ResponseEntity<Map<String, String>> handleCartEmptyException(CartEmptyException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Cart is empty");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(InvalidOrderStatusException.class)
    public ResponseEntity<Map<String, String>> handleInvalidOrderStatusException(InvalidOrderStatusException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid order status");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(RefundProcessingException.class)
    public ResponseEntity<Map<String, String>> handleRefundProcessingException(RefundProcessingException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Refund processing failed");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Unexpected error: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
