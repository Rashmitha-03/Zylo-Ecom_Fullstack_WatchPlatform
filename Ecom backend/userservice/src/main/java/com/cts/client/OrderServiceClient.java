package com.cts.client; // Or com.cts.config, depending on your project structure

import com.cts.dto.OrderDTO; // Assuming OrderDTO is a shared DTO or replicated in User Service
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "orderService") // 'order-service' is the name of your order microservice
public interface OrderServiceClient {

    // This method will call the endpoint in the Order Microservice
    // to get orders associated with a specific user ID.
    // The path should match the endpoint you already have in your OrderController:
    // @GetMapping("/user/{userId}")
    @GetMapping("/orders/user/{userId}")
    ResponseEntity<List<OrderDTO>> getOrdersByUserId(@PathVariable("userId") int userId);
}