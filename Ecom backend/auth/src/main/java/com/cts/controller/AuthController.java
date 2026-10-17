package com.cts.controller;
 
import com.cts.client.UserServiceClient;
import com.cts.dto.LoginRequest;
import com.cts.dto.LoginResponse;
import com.cts.dto.RegisterRequest;
import com.cts.dto.RegisterResponse;
import com.cts.dto.UserAuthDetailsDto;
import com.cts.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
//@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth") // Base path for auth endpoints
@RequiredArgsConstructor
public class AuthController {
 
private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
 
private final UserServiceClient userServiceClient;
private final PasswordEncoder passwordEncoder;
private final JwtUtil jwtUtil;
 
@PostMapping("/register")
public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
     logger.info("Auth Service: Received registration request for email: {}", request.getEmail());
     try {
         // Call the User Microservice to handle user registration
         ResponseEntity<RegisterResponse> userRegistrationResponse = userServiceClient.registerUser(request);
 
         if (userRegistrationResponse.getStatusCode().is2xxSuccessful()) {
             logger.info("Auth Service: User registered successfully via User Service for email: {}", request.getEmail());
             return ResponseEntity.ok(userRegistrationResponse.getBody());
         } else {
             logger.warn("Auth Service: User registration failed in User Service for email: {}. Status: {}",
                     request.getEmail(), userRegistrationResponse.getStatusCode());
             // Propagate error from User Service or map to a generic error
             return ResponseEntity.status(userRegistrationResponse.getStatusCode())
                     .body(new RegisterResponse("Registration failed", request.getEmail()));
         }
     } catch (Exception e) {
         logger.error("Auth Service: Error during registration for email {}: {}", request.getEmail(), e.getMessage(), e);
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                 .body(new RegisterResponse("An unexpected error occurred during registration.", request.getEmail()));
     }
}
 
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
     logger.info("Auth Service: Received login request for email: {}", request.getEmail());
     try {
         // 1. Call User Microservice to get user details (hashed password, roles, userId)
         ResponseEntity<UserAuthDetailsDto> userDetailsResponse = userServiceClient.getUserAuthDetailsByEmail(request.getEmail());
 
         if (userDetailsResponse.getStatusCode() != HttpStatus.OK || userDetailsResponse.getBody() == null) {
             logger.warn("Auth Service: User details not found for login email: {}. Status: {}",
                     request.getEmail(), userDetailsResponse.getStatusCode());
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                     .body(new LoginResponse(null, request.getEmail(), null, 0)); // Or custom error response
         }
 
         UserAuthDetailsDto userAuthDetails = userDetailsResponse.getBody();
 
         // 2. Verify password using the PasswordEncoder (same one used in User Service)
         if (!passwordEncoder.matches(request.getPassword(), userAuthDetails.getPassword())) {
             logger.warn("Auth Service: Invalid credentials for email: {}", request.getEmail());
             // Optionally, inform User Service about failed login attempt here if user service does not track on its own logic
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                     .body(new LoginResponse(null, request.getEmail(), null, 0)); // Or custom error response
         }
 
         // 3. If credentials are valid, generate JWT
         String token = jwtUtil.generateToken(userAuthDetails.getUserId(), userAuthDetails.getEmail(), userAuthDetails.getRoles());
         logger.info("Auth Service: Login successful and JWT generated for email: {}", request.getEmail());
 
         // 4. Return JWT to the client
         return ResponseEntity.ok(new LoginResponse(token, userAuthDetails.getUsername(), userAuthDetails.getRoles(), userAuthDetails.getUserId()));
 
     } catch (Exception e) {
         logger.error("Auth Service: Error during login for email {}: {}", request.getEmail(), e.getMessage(), e);
         // Handle specific exceptions like UserNotFoundException from Feign client if desired
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                 .body(new LoginResponse(null, request.getEmail(), null, 0)); // Or custom error response
     }
}
}