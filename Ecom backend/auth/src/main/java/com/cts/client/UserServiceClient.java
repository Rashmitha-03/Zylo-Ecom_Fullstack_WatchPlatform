package com.cts.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.cts.dto.RegisterRequest;
import com.cts.dto.RegisterResponse;
import com.cts.dto.UserAuthDetailsDto;

@FeignClient(name = "${user-service.url}", path = "/api/v1/users") // 'user-service.url' from properties, base path from User service controller
public interface UserServiceClient {

    @GetMapping("/auth/{email}")
    ResponseEntity<UserAuthDetailsDto> getUserAuthDetailsByEmail(@PathVariable("email") String email);

    @PostMapping("/register")
    ResponseEntity<RegisterResponse> registerUser(@RequestBody RegisterRequest request);

    // If you need to expose other User Service methods to Auth Service, add them here
}
