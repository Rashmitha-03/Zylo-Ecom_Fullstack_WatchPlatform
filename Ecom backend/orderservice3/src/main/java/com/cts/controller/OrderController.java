package com.cts.controller;

import com.cts.config.PaymentFC;
import com.cts.dto.*;
import com.cts.exception.OrderNotFoundException;
import com.cts.service.OrderService;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
	
	private static final Logger logger = LoggerFactory.getLogger(OrderController.class);


    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentFC paymentFC;

    @PostMapping("/cash-on-delivery/{userId}")
    //@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> placeOrderCashOnDelivery(@PathVariable int userId, @RequestBody OfflineDTO offlineDTO) {
        offlineDTO.setUserId(userId); // Make sure your DTO handles this
        OfflineDTO createdOrder = orderService.placeOrderCashOnDelivery(offlineDTO);
        return ResponseEntity.ok(Map.of(
                "message", "Order placed successfully",
                "orderDetails", createdOrder
        ));
    }

    @PostMapping("/online-payment/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> startPaymentFlow(@RequestBody OrderDTO orderDTO) {
        OrderDTO enrichedOrder = orderService.startOnlinePayment(orderDTO);
        return ResponseEntity.ok(Map.of(
                "message", "Payment has been initiated",
                "paymentDetails", enrichedOrder
        ));
    }

    @PostMapping("/online-payment/finalize")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> finalizeOrder(@RequestParam Long paymentId) {
        String status = paymentFC.viewPaymentStatus(paymentId).getBody();
        if (!"SUCCESS".equalsIgnoreCase(status)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Payment not completed. Current status: " + status
            ));
        }
        OrderDTO finalizedOrder = orderService.finalizeOnlineOrder(paymentId);
        return ResponseEntity.ok(Map.of(
                "message", "Payment SUCCESS and order placed!",
                "orderDetails", finalizedOrder
        ));
    }

    @PostMapping("/cancel/{userId}/{orderId}")
    @PreAuthorize(" #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable int userId, @PathVariable String orderId) {
        OrderDTO cancelledOrder = orderService.cancelOrder(orderId);
        return ResponseEntity.ok(Map.of(
                "message", "Order cancelled successfully",
                "cancelledOrder", cancelledOrder
        ));
    }

    @PostMapping("/return/{userId}/{orderId}")
    @PreAuthorize(" #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Map<String, Object>> returnOrder(@PathVariable int userId,
                                                           @PathVariable String orderId,
                                                           @RequestParam int productId,
                                                           @RequestParam int quantity,
                                                           @RequestParam(required = false) String upiId) {
        OrderDTO returned = orderService.returnOrder(orderId, productId, quantity, upiId);
        return ResponseEntity.ok(Map.of(
                "message", "Return processed successfully.",
                "returnedProduct", returned
        ));
    }

    @PutMapping("/replace/{userId}/{orderId}")
    @PreAuthorize(" #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Map<String, Object>> replaceOrder(@PathVariable int userId,
                                                            @PathVariable String orderId,
                                                            @RequestParam int productId,
                                                            @RequestParam int quantity,
                                                            @RequestParam(required = false) String upiId) {
        OrderDTO replacedOrder = orderService.replaceOrder(orderId, productId, quantity, upiId);
        return ResponseEntity.ok(Map.of(
                "message", "Order replaced successfully",
                "replacedOrder", replacedOrder
        ));
    }

    @GetMapping("/search/{userId}/{orderId}")
    @PreAuthorize("hasRole('ADMIN') || #userId == authentication.principal.claims['userId']")
    public ResponseEntity<OrderDTO> searchOrderById(@PathVariable int userId, @PathVariable String orderId) {
        return ResponseEntity.ok(orderService.searchOrderById(orderId));
    }

    @GetMapping("/status/{userId}/{orderStatus}")
    @PreAuthorize(" #userId == authentication.principal.claims['userId']")
    public ResponseEntity<List<OrderDTO>> searchOrderByStatus(@PathVariable int userId,@PathVariable String orderStatus) {
        return ResponseEntity.ok(orderService.searchOrderByStatus(orderStatus));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') || #userId == authentication.principal.claims['userId']")
    public ResponseEntity<List<OrderDTO>> getOrdersByUserId(@PathVariable int userId) {
        try {
            return ResponseEntity.ok(orderService.searchOrderByUserId(userId));
        } catch (Exception e) {
            logger.error("❌ Error fetching orders for user ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }


    @PutMapping("/admin/deliver/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> markOrderAsDelivered(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.markOrderAsDelivered(orderId));
    }

    @PutMapping("/payments/updatestatus/{userId}/{paymentId}")
    @PreAuthorize("#userId == authentication.principal.claims['userId']")
    public ResponseEntity<Map<String, String>> updatePaymentStatus(@PathVariable int userId,@PathVariable Long paymentId,
                                                                   @RequestParam(defaultValue = "false") boolean cancel) {
        try {
            ResponseEntity<String> response = paymentFC.viewPaymentStatus(paymentId);
            String currentStatus = response.getBody();

            if (!"PENDING".equalsIgnoreCase(currentStatus)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Payment status must be PENDING to update. Found: " + currentStatus
                ));
            }

            ResponseEntity<String> updateResponse = paymentFC.updatePaymentStatus(paymentId, cancel);
            return ResponseEntity.ok(Map.of(
                    "message", "Payment status updated successfully.",
                    "updatedStatus", updateResponse.getBody()
            ));
        } catch (FeignException.NotFound fe) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Invalid Payment ID: " + paymentId + ". No matching record found."
            ));
        }
    }

    @PostMapping("/cart/cash-delivery/{userId}")
   // @PreAuthorize("#userId == authentication.principal.claims['userId']")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> placeOrderFromCartCashOnDelivery(@PathVariable int userId,
                                                                                @RequestParam int addressId) {
        CartClientDTO orderDTO = orderService.placeOrderFromCartCashOnDelivery(userId, addressId);
        return ResponseEntity.ok(Map.of(
                "message", "Order placed successfully. Cart cleared.",
                "orderId", orderDTO.getOrderId(),
                "totalPrice", orderDTO.getTotalPrice(),
                "addressId", orderDTO.getAddressId(),
                "products", orderDTO.getItems()
        ));
    }

    @PostMapping("/cart/online/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> startCartOnlinePayment(@RequestBody CartClientOnlineDTO orderDTO) {
        Long paymentId = orderService.startCartOnlinePayment(orderDTO);
        return ResponseEntity.ok(Map.of(
                "paymentId", paymentId,
                "message", "Payment initiated successfully."
        ));
    }

    @PostMapping("/cart/online/finalize/{paymentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> finalizeCartOnlineOrder(@PathVariable Long paymentId) {
        OrderDTO orderDetails = orderService.finalizeCartOnlineOrder(paymentId);
        return ResponseEntity.ok(Map.of(
                "orderDetails", orderDetails,
                "message", "Payment SUCCESS and order placed!"
        ));
    }

    @GetMapping("/track-order/{userId}/{orderId}")
    @PreAuthorize(" #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Map<String, Object>> trackOrderById(@PathVariable int userId, @PathVariable String orderId) {
        try {
            OrderDTO trackedOrder = orderService.trackOrderById(orderId);
            return ResponseEntity.ok(Map.of(
                    "message", "Order found successfully",
                    "orderDetails", trackedOrder
            ));
        } catch (OrderNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        }
    }
    
    @GetMapping("/report/product-frequency")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, ProductStats>> getProductFrequencies() {
        return ResponseEntity.ok(orderService.getOverallProductStats());
    }
    
    @GetMapping("/stats/gender-frequency")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, ProductStats>> getGenderFrequencies() {
        return ResponseEntity.ok(orderService.getGenderStats());
    }

    

}
