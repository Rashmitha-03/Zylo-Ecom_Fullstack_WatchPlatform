package com.cts.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import com.cts.dto.CartItemDTO;

@FeignClient(name = "CartModule", configuration = FeignClientConfig.class)  //, url = "${cart-service.url:http://localhost:9926}") // Adjust port if different
public interface CartServiceClient {

@PostMapping("/api/v1/cart/{userId}/createCart")
 ResponseEntity<String> createCart(@PathVariable("userId") int userId);


@GetMapping("/api/v1/cart/{userId}/viewAllProductsFromCart")
public ResponseEntity<List<CartItemDTO>> getCartItems(@PathVariable Integer userId);
}