package com.cts.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user3", configuration = FeignClientConfig.class)
public interface UserFC {

    @GetMapping("/api/v1/users/{userId}/id")
    ResponseEntity<Integer> getUserId(@PathVariable int userId);
}
