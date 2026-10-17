package com.cts.config;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.cts.dto.AddressResponse;

@FeignClient(name="user3" ,configuration = FeignClientConfig.class)
public interface UserFC {
	
	@GetMapping("/api/v1/users/{userId}/id")
	public ResponseEntity<Integer> getUserId(@PathVariable("userId") int userId);
	
	 @GetMapping("/api/addresses/{userId}")
	 public ResponseEntity<List<AddressResponse>> getUserAddresses(@PathVariable int userId);


}
