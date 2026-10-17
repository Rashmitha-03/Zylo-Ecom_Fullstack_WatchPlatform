package com.cts.controller;

import com.cts.dto.*;
import com.cts.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.Map;
import java.util.List;

//@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/users")
@EnableFeignClients(basePackages = "com.cts.client")
@RequiredArgsConstructor
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final IUserService userService;

    // --- Helper method for consistent debug logging of Authentication ---
    private void logAuthenticationDetails(Authentication authentication) {
        if (authentication != null) {
            logger.debug("Authentication Object: {}", new Object[]{authentication});
            logger.debug("  Principal Type: {}", new Object[]{authentication.getPrincipal().getClass().getName()});
            logger.debug("  Principal: {}", new Object[]{authentication.getPrincipal()});
            logger.debug("  Authorities: {}", new Object[]{authentication.getAuthorities()});
            logger.debug("  Details: {}", new Object[]{authentication.getDetails()});

            if (authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                logger.debug("  JWT Claims: {}", new Object[]{jwt.getClaims()});
                logger.debug("  JWT userId claim: {}", new Object[]{jwt.getClaim("userId")});
                logger.debug("  JWT 'sub' claim (email): {}", new Object[]{jwt.getClaim("sub")});
            } else if (authentication.getPrincipal() instanceof String && authentication.getDetails() instanceof Long) {
                // This block is for when customHeaderAuthenticationFilter is active and sets principal as String and details as Long
                logger.debug("  User ID (from details, potentially custom filter): {}", new Object[]{authentication.getDetails()});
                logger.debug("  Email (from principal, potentially custom filter): {}", new Object[]{authentication.getPrincipal()});
            } else if (authentication.getPrincipal() instanceof Map) {
                // Sometimes claims might be directly exposed as a Map, depending on converters
                Map<String, Object> claims = (Map<String, Object>) authentication.getPrincipal();
                logger.debug("  Principal is a Map (claims): {}", new Object[]{claims});
                logger.debug("  Map userId claim: {}", new Object[]{claims.get("userId")});
                logger.debug("  Map 'sub' claim (email): {}", new Object[]{claims.get("sub")});
            }
        } else {
            logger.debug("Authentication object is null.");
        }
    }


    // --- Public Endpoints (Accessible to Anyone) ---
    @PostMapping("/register")
    @PreAuthorize("permitAll()")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("API Request: Registering new user with email: {}", request.getEmail());
        RegisterResponse response = userService.registerUser(request);
        logger.info("API Response: User registered successfully for email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest request) {
        logger.info("API Request: User login attempt for email: {}", request.getEmail());
        try {
            String response = userService.login(request);
            logger.info("API Response: User login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("API Response: Login failed for email: {}. Reason: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        logger.info("API Request: Forgot password request for email: {}", request.getEmail());
        userService.forgotPassword(request);
        logger.info("API Response: Forgot password process initiated for email: {}", request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        logger.info("API Request: Resetting password for email: {}", request.getEmail()); // Log email instead of token directly
        userService.resetPassword(request);
        logger.info("API Response: Password reset successfully.");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/recover-account")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Void> recoverAccount(@Valid @RequestBody AccountRecoveryRequest request) {
        logger.info("API Request: Account recovery request for email: {}", request.getEmail());
        userService.recoverAccount(request);
        logger.info("API Response: Account recovery process initiated for email: {}", request.getEmail());
        return ResponseEntity.ok().build();
    }

    // --- Protected Endpoints with Authorization Logic ---

    // Get user by ID: Accessible by ADMIN or the user themselves (if userId matches the ID from JWT).
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<UserProfileResponse> getUser(@PathVariable int userId, Authentication authentication) {
        logger.info("API Request: Fetching user profile for ID: {}", userId);
        logAuthenticationDetails(authentication);
        UserProfileResponse response = userService.getUserById(userId);
        logger.info("API Response: User profile fetched successfully for ID: {}", userId);
        return ResponseEntity.ok(response);
    }

    // Get all users: Only accessible by ADMIN.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        logger.info("API Request: Fetching all users.");
        List<UserSummaryResponse> users = userService.getAllUsers();
        logger.info("API Response: Fetched {} users.", users.size());
        return ResponseEntity.ok(users);
    }

    // Update profile: Accessible by ADMIN or the user themselves.
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable int userId,
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        logger.info("API Request: Updating profile for user ID: {}", userId);
        logAuthenticationDetails(authentication);
        UserProfileResponse response = userService.updateUserProfile(userId, request);
        logger.info("API Response: Profile updated successfully for user ID: {}", userId);
        return ResponseEntity.ok(response);
    }

    // Update profile image: Accessible by ADMIN or the user themselves.
    @PutMapping("/{userId}/profile-image")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<UserProfileResponse> updateProfileImage(
            @PathVariable int userId,
            @Valid @RequestBody UpdateProfileImageRequest request,
            Authentication authentication) { // Added Authentication parameter
        logger.info("API Request: Updating profile image for user ID: {}", userId);
        logAuthenticationDetails(authentication);
        UserProfileResponse response = userService.updateProfileImage(userId, request);
        logger.info("API Response: Profile image updated successfully for user ID: {}", userId);
        return ResponseEntity.ok(response);
    }


    // Change password: Accessible by ADMIN or the user themselves.
    @PutMapping("/{userId}/change-password")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']") // Corrected to use #userId from path
    public ResponseEntity<Void> changePassword(
            @PathVariable int userId,
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        logger.info("API Request: Changing password for user ID: {}", userId);
        logAuthenticationDetails(authentication);
        // Ensure the request's email matches the user ID from path or JWT claim
        userService.changePassword(request);
        logger.info("API Response: Password changed successfully for user ID: {}", userId);
        return ResponseEntity.ok().build();
    }

    // Get block status: Accessible by ADMIN or the user themselves (by matching email from JWT's 'sub' claim).
    @GetMapping("/block-status")
    @PreAuthorize("hasRole('ADMIN') or #email == authentication.principal.claims['sub']")
    public ResponseEntity<UserBlockStatusResponse> getBlockStatus(@RequestParam String email, Authentication authentication) {
        logger.info("API Request: Getting block status for email: {}", email);
        logAuthenticationDetails(authentication);
        UserBlockStatusResponse response = userService.getBlockStatus(email);
        logger.info("API Response: Block status fetched for email: {}", email);
        return ResponseEntity.ok(response);
    }

    // Unlock user: Only accessible by ADMIN.
    @PostMapping("/unlock/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlockUser(@PathVariable String email) {
        logger.info("API Request: Unlocking user with email: {}", email);
        userService.unlockUser(email);
        logger.info("API Response: User unlocked successfully for email: {}", email);
        return ResponseEntity.ok().build();
    }

    // Assign roles: Only accessible by ADMIN.
    @PutMapping("/assign-roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignRoles(@Valid @RequestBody RoleAssignmentRequest request) {
        logger.info("API Request: Assigning roles to user ID: {}", request.getUserId());
        userService.assignRoles(request);
        logger.info("API Response: Roles assigned successfully for user ID: {}", request.getUserId());
        return ResponseEntity.ok().build();
    }

    // Update user status: Only accessible by ADMIN.
    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateUserStatus(
            @PathVariable int userId,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        logger.info("API Request: Updating status for user ID: {}. New status: {}", userId, request.isActive() ? "Active" : "Inactive");
        userService.updateUserStatus(userId, request);
        logger.info("API Response: User status updated successfully for ID: {}", userId);
        return ResponseEntity.ok().build();
    }

    // Delete user (soft delete): Only accessible by ADMIN.
    @DeleteMapping("/softdelete/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Void> softdeleteUser(@PathVariable int userId) {
        logger.info("API Request: Soft deleting user with ID: {}", userId);
        userService.softdeleteUser(userId);
        logger.info("API Response: User soft deleted successfully for ID: {}", userId);
        return ResponseEntity.ok().build();
    }

    // Delete user permanently (hard delete): Only accessible by ADMIN (use with extreme caution).
    @DeleteMapping("/delete/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> hardDeleteUser(@PathVariable int userId) {
        logger.warn("API Request: PERMANENTLY deleting user with ID: {}", userId);
        userService.hardDeleteUser(userId);
        logger.info("API Response: User permanently deleted for ID: {}", userId);
        return ResponseEntity.ok().build();
    }

    // Get user ID: Accessible by ADMIN or the user themselves.
    @GetMapping("/{userId}/id")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Integer> getUserId(@PathVariable int userId, Authentication authentication){
        logger.info("API Request: Fetching user ID (specific endpoint) for ID: {}", userId);
        logAuthenticationDetails(authentication);
        int id = userService.getUserId(userId);
        logger.info("API Response: User ID {} retrieved successfully.", id);
        return ResponseEntity.ok(id);
    }

    // Get cart items for a user: Accessible by ADMIN or the user themselves.
    @GetMapping("/{userId}/viewAllProducts")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<List<CartItemDTO>> getCartItems(@PathVariable Integer userId, Authentication authentication) {
        logger.info("API Request: Fetching cart items for user ID: {}", userId);
        logAuthenticationDetails(authentication);
        List<CartItemDTO> cartItems = userService.getUserCartItems(userId);
        logger.info("API Response: Fetched {} cart items for user ID: {}", cartItems.size(), userId);
        return ResponseEntity.ok(cartItems);
    }

    // Get order details for a user: Accessible by ADMIN or the user themselves.
    @GetMapping("/{userId}/orders")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']") // Added PreAuthorize
    public ResponseEntity<List<OrderDTO>> getOrdersForUser(@PathVariable int userId, Authentication authentication) {
        logger.info("API Request: Fetching all orders for user ID: {}", userId);
        logAuthenticationDetails(authentication); // Log authentication details
        try {
            List<OrderDTO> orders = userService.getOrdersOfUser(userId);
            logger.info("API Response: Fetched {} orders for user ID: {}", orders.size(), userId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            logger.error("Error fetching orders for user ID: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }


    // --- Internal Service-to-Service Endpoint (No @PreAuthorize) ---
    @GetMapping("/auth/{email}")
    public ResponseEntity<UserAuthDetailsDto> getUserAuthDetailsByEmail(@PathVariable String email) {
        logger.info("Received authentication details request for email: {}", email);
        try {
            UserAuthDetailsDto userAuthDetails = userService.getUserAuthDetailsByEmail(email);

            if (userAuthDetails == null) {
                logger.warn("Authentication details not found for email: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            return ResponseEntity.ok(userAuthDetails);
        } catch (Exception e) {
            logger.error("Error fetching authentication details for email {}: {}", email, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}