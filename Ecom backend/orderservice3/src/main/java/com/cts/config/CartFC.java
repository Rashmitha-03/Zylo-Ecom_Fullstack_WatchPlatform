package com.cts.config;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
 

import com.cts.dto.CartItemDTO;
 
@FeignClient(name = "CartModule" ,configuration = FeignClientConfig.class) // Update URL as needed
public interface CartFC {
	@GetMapping("/api/v1/cart/{userId}/viewAllProductsFromCart") 
	List<CartItemDTO> getCartItems(@PathVariable("userId") int userId);
 
	@GetMapping("/api/v1/cart/{userId}/total-priceOfCart")
	Double getTotalPrice(@PathVariable int userId);
	
	
	 @DeleteMapping("/api/v1/cart/{userId}/clearFromCart")
	    public ResponseEntity<String> clearCart(@PathVariable int userId);
}