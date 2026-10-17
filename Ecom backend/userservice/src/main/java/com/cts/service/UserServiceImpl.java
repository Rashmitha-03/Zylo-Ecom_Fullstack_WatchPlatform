package com.cts.service;

import com.cts.dto.*;
import com.cts.entity.User;
import com.cts.enums.Role;
import com.cts.exception.EmailAlreadyExistsException;
import com.cts.exception.UserNotFoundException;
import com.cts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

// NEW IMPORTS for Spring Security Exceptions
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;


import com.cts.client.CartServiceClient;
import com.cts.client.OrderServiceClient;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    private final ModelMapper modelMapper;

    private final CartServiceClient cartServiceClient;
    
    private final OrderServiceClient orderServiceClient;

    @Override
    @Transactional // Ensure transactionality for database operations
    public String login(LoginRequest request) {
        logger.info("Attempting login for user with email: {}", request.getEmail());
        User user;
        try {
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.debug("User found for email: {}", request.getEmail());
        } catch (UserNotFoundException e) {
            logger.warn("Login attempt failed for non-existent email: {}. Error: {}", request.getEmail(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("An unexpected error occurred while finding user by email {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("An unexpected error occurred during login.", e);
        }

        // Removed the isActive check from here, as it's now handled in getUserAuthDetailsByEmail
        // for authentication flow (UserDetailsService context).

        // Added null check for blockedUntil for robustness
        if (user.isBlocked() && user.getBlockedUntil() != null && user.getBlockedUntil().isAfter(LocalDateTime.now())) {
            logger.warn("Login attempt for blocked user: {}. Blocked until: {}", user.getEmail(), user.getBlockedUntil());
            throw new RuntimeException("User is blocked until " + user.getBlockedUntil());
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Invalid password for user: {}. Handling failed login.", user.getEmail());
            // This call runs in a new transaction to ensure login attempts are persisted
            handleFailedLogin(user.getEmail());
            throw new RuntimeException("Invalid credentials");
        }

        try {
            // Only reset login attempts if login is successful
            user.setLoginAttempts(0);
            // NEW: Set the lastLogin timestamp to the current time
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            logger.info("User {} logged in successfully. Login attempts reset and last login updated.", user.getEmail());
        } catch (Exception e) {
            logger.error("Error resetting login attempts or updating last login for user {}: {}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Error during login, failed to reset attempts or update last login.", e);
        }

        return "Login successful";
    }

    @Override
    public RegisterResponse registerUser(RegisterRequest request) {
        logger.info("Attempting to register new user with email: {}", request.getEmail());
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                logger.warn("User registration failed: Email already registered - {}", request.getEmail());
                throw new EmailAlreadyExistsException("Email already registered");
            }
            User user = modelMapper.map(request, User.class);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setRoles(Set.of(Role.USER));
            // Ensure new users are active by default
            user.setActive(true); // Explicitly set to active
            user.setBlocked(false); // Explicitly set to not blocked

            User savedUser = userRepository.save(user);
            logger.info("User registered successfully with email: {}. User ID: {}", savedUser.getEmail(), savedUser.getUserID());

            try {
                logger.info("Attempting to create cart for new user with ID: {}", savedUser.getUserID());
                ResponseEntity<String> cartCreationResponse = cartServiceClient.createCart(savedUser.getUserID());

                if (cartCreationResponse.getStatusCode().is2xxSuccessful()) {
                    logger.info("Cart created successfully for user ID {}. Response from Cart Service: {}",
                                 savedUser.getUserID(), cartCreationResponse.getBody());
                } else {
                    logger.warn("Failed to create cart for user ID {} from Cart Service. Status: {}, Body: {}",
                                 savedUser.getUserID(), cartCreationResponse.getStatusCode(), cartCreationResponse.getBody());
                    throw new RuntimeException("Failed to create cart for new user. Cart Service responded with status: " + cartCreationResponse.getStatusCode());
                }
            } catch (feign.FeignException.FeignClientException e) {
                logger.error("Client error from Cart Service when creating cart for user ID {}: Status: {}, Message: {}",
                                 savedUser.getUserID(), e.status(), e.contentUTF8(), e);
                throw new RuntimeException("Error from Cart Service (client error): " + e.getMessage(), e);
            } catch (feign.FeignException.FeignServerException e) {
                logger.error("Server error from Cart Service when creating cart for user ID {}: Status: {}, Message: {}",
                                 savedUser.getUserID(), e.status(), e.contentUTF8(), e);
                throw new RuntimeException("Cart Service internal error (server error): " + e.getMessage(), e);
            } catch (Exception e) {
                logger.error("Unexpected error communicating with Cart Service to create cart for user ID {}: {}",
                                 savedUser.getUserID(), e.getMessage(), e);
                throw new RuntimeException("Error communicating with Cart Service during cart creation.", e);
            }

            return new RegisterResponse("User registered successfully", savedUser.getEmail());

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            logger.error("An unexpected error occurred during user registration for email {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to register user.", e);
        }
    }

    @Override
    public UserProfileResponse getUserById(int userId) {
        logger.debug("Attempting to fetch user with ID: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.info("User found for ID: {}. Email: {}", userId, user.getEmail());
            return modelMapper.map(user, UserProfileResponse.class);
        } catch (UserNotFoundException e) {
            logger.warn("User fetch failed: User with ID {} not found. Error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @Override
    public List<UserSummaryResponse> getAllUsers() {
        logger.info("Fetching all users.");
        try {
            List<UserSummaryResponse> users = userRepository.findAll().stream()
                    .map(user -> {
                        List<String> userRoles = user.getRoles() != null ?
                                user.getRoles().stream()
                                    .map(role -> role.name())
                                    .collect(Collectors.toList()) :
                                Collections.emptyList();

                        return new UserSummaryResponse(
                                user.getUserID(),
                                user.getFirstName(),
                                user.getLastName(),
                                user.getEmail(),
                                user.isActive(),
                                user.isBlocked(),
                                userRoles
                        );
                    })
                    .collect(Collectors.toList());
            logger.debug("Successfully fetched {} users.", users.size());
            return users;
        } catch (Exception e) {
            logger.error("An unexpected error occurred while fetching all users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve all users.", e);
        }
    }

    @Override
    public UserProfileResponse updateUserProfile(int userId, UpdateProfileRequest request) {
        logger.info("Attempting to update profile for user ID: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.debug("Found user {} for profile update.", user.getEmail());

            modelMapper.map(request, user);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            logger.info("User profile updated successfully for ID: {}", userId);
            return modelMapper.map(user, UserProfileResponse.class);
        } catch (UserNotFoundException e) {
            logger.warn("User profile update failed: User with ID {} not found. Error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @Override
    public UserProfileResponse updateProfileImage(int userId, UpdateProfileImageRequest request) {
        logger.info("Attempting to update profile image for user ID: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.debug("Found user {} for profile image update.", user.getEmail());

            user.setProfileimg(request.getProfileimg());
            user.setUpdatedAt(LocalDateTime.now());

            userRepository.save(user);
            logger.info("User profile image updated successfully for ID: {}", userId);

            UserProfileResponse response = modelMapper.map(user, UserProfileResponse.class);
            return response;
        } catch (UserNotFoundException e) {
            logger.warn("User profile image update failed: User with ID {} not found. Error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        logger.info("Attempting to change password for user with email: {}", request.getEmail());
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.debug("Found user {} to change password.", user.getEmail());

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            logger.info("Password changed successfully for user: {}", request.getEmail());
        } catch (UserNotFoundException e) {
            logger.warn("Password change failed: User with email {} not found. Error: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        logger.info("Processing forgot password request for email: {}", request.getEmail());
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.debug("Found user {} for forgot password.", user.getEmail());

            String verificationToken = "token-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 8);
            user.setVerificationToken(verificationToken);
            userRepository.save(user);
            logger.info("Verification token generated for user {}. Token (partially logged): {}", request.getEmail(), verificationToken.substring(0, 10) + "...");
        } catch (UserNotFoundException e) {
            logger.warn("Forgot password failed: User with email {} not found. Error: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        logger.info("Attempting to reset password for user with email: {}", request.getEmail());
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.debug("Found user {} for password reset.", user.getEmail());

            if (user.getVerificationToken() == null || !request.getToken().equals(user.getVerificationToken())) {
                logger.warn("Invalid or expired token provided for password reset for user: {}", request.getEmail());
                throw new RuntimeException("Invalid or expired token");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            user.setVerificationToken(null);
            userRepository.save(user);
            logger.info("Password reset successfully for user: {}", request.getEmail());
        } catch (UserNotFoundException e) {
            logger.warn("Password reset failed: User with email {} not found. Error: {}", request.getEmail(), e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            logger.warn("Password reset failed due to invalid token for user {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @Override
    public void recoverAccount(AccountRecoveryRequest request) {
        logger.info("Processing account recovery request for email: {}", request.getEmail());
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.debug("Found user {} for account recovery.", user.getEmail());

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            user.setActive(true); // Assume recovery implies reactivation
            user.setBlocked(false); // Assume recovery implies unblocking
            user.setLoginAttempts(0); // Reset login attempts on successful recovery
            user.setBlockedUntil(null); // Clear any blocked until time
            user.setUpdatedAt(LocalDateTime.now()); // Update timestamp
            userRepository.save(user);
            logger.info("Account recovered and password updated for user: {}", request.getEmail());
        } catch (UserNotFoundException e) {
            logger.warn("Account recovery failed: User with email {} not found. Error: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional // Ensure transactionality
    public void unlockUser(String email) {
        logger.info("Attempting to unlock user with email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (!user.isBlocked() && user.getLoginAttempts() < 3) {
            logger.warn("User {} is not blocked or has less than 3 login attempts. No unlock action needed.", email);
        }

        user.setBlocked(false);
        user.setBlockedUntil(null);
        user.setLoginAttempts(0); // Reset login attempts on unlock
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logger.info("User {} unlocked successfully. Login attempts reset.", email);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW) // NEW: Use REQUIRES_NEW for separate transaction
    public void handleFailedLogin(String email) {
        logger.warn("Handling failed login attempt for email: {}", email);
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            int attempts = user.getLoginAttempts() + 1;
            user.setLoginAttempts(attempts);
            user.setUpdatedAt(LocalDateTime.now());

            if (attempts >= 3) {
                user.setBlocked(true);
                user.setBlockedUntil(LocalDateTime.now().plusMinutes(5)); // Block for 5 minutes
                logger.warn("User {} blocked for 5 minutes due to {} failed login attempts.", email, attempts);
            }
            userRepository.save(user);
        } else {
            logger.warn("Failed login attempt for non-existent user: {}", email);
        }
    }

    @Override
    public void assignRoles(RoleAssignmentRequest request) {
        logger.info("Attempting to assign roles for user ID: {}", request.getUserId());
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + request.getUserId()));

        user.setRoles(request.getRoles()); // Direct assignment
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logger.info("Roles assigned successfully for user ID {}. New roles: {}", request.getUserId(), user.getRoles());
    }

    @Override
    public UserBlockStatusResponse getBlockStatus(String email) {
        logger.debug("Fetching block status for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        return new UserBlockStatusResponse(user.isBlocked(), user.getBlockedUntil());
    }

    @Override
    @Transactional
    public void updateUserStatus(int userId, UserStatusUpdateRequest request) {
        logger.info("Attempting to update status for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        user.setActive(request.isActive());
        user.setBlocked(request.isBlocked());
        user.setUpdatedAt(LocalDateTime.now());

        if (request.isBlocked() && user.getBlockedUntil() == null) {
            // If blocking user and no blockedUntil is set, set a default (e.g., 5 mins)
            // Or, if your request body includes blockedUntil, use that.
            // For simplicity here, if blocked, it's just blocked until admin unblocks.
        } else if (!request.isBlocked()) {
            user.setBlockedUntil(null); // Clear blockedUntil if unblocked
            user.setLoginAttempts(0); // Reset login attempts when unblocked
        }

        userRepository.save(user);
        logger.info("User status updated successfully for ID: {}. Active: {}, Blocked: {}", userId, user.isActive(), user.isBlocked());
    }
    
    @Override
    @Transactional // Ensure transactionality
    public void softdeleteUser(int userId) {
        logger.info("Attempting to soft delete user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        user.setActive(false); // Mark user as inactive - THIS IS THE CRUCIAL PART FOR SOFT DELETE
        user.setUpdatedAt(LocalDateTime.now()); // Update timestamp
        User savedUser = userRepository.save(user); // Capture the saved user to log its state
        logger.info("User with ID: {} soft deleted (marked inactive) successfully. New isActive status: {}", savedUser.getUserID(), savedUser.isActive());
    }

    @Override
    @Transactional
    public void hardDeleteUser(int userId) {
        logger.warn("PERMANENTLY DELETING user with ID: {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }
        userRepository.deleteById(userId);
        logger.info("User with ID: {} permanently deleted.", userId);
        // Additional cleanup like deleting associated carts/orders can be added here
        // For example: cartServiceClient.deleteCart(userId);
        // orderServiceClient.deleteUserOrders(userId);
    }

    @Override
    public Integer getUserId(int userId) {
        logger.debug("Fetching user ID (internal service call) for ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return user.getUserID();
    }

    @Override
    public List<CartItemDTO> getUserCartItems(Integer userId) {
        logger.info("Fetching cart items for user ID: {}", userId);
        try {
            ResponseEntity<List<CartItemDTO>> response = cartServiceClient.getCartItems(userId);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("Successfully fetched {} cart items for user ID: {}", response.getBody().size(), userId);
                return response.getBody();
            } else {
                logger.warn("Failed to fetch cart items for user {}. Status: {}. Body: {}", userId, response.getStatusCode(), response.getBody());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            logger.error("Error fetching cart items for user ID {}: {}", userId, e.getMessage(), e);
            return Collections.emptyList(); // Return empty list on error
        }
    }

    @Override
    public List<OrderDTO> getOrdersOfUser(int userId) {
        logger.info("Fetching orders for user ID: {}", userId);
        try {
            ResponseEntity<List<OrderDTO>> response = orderServiceClient.getOrdersByUserId(userId);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("Successfully fetched {} orders for user ID: {}", response.getBody().size(), userId);
                return response.getBody();
            } else {
                logger.warn("Failed to fetch orders for user {}. Status: {}. Body: {}", userId, response.getStatusCode(), response.getBody());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            logger.error("Error fetching orders for user ID {}: {}", userId, e.getMessage(), e);
            return Collections.emptyList(); // Return empty list on error
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        logger.debug("Fetching User entity by email: {}", email);
        return userRepository.findByEmail(email);
    }

    // --- Implementation for IUserService.getUserAuthDetailsByEmail(String) ---
    // This returns the DTO with authentication details. This is where the core logic
    // for preventing login of inactive users should reside for Spring Security integration.
    @Override
    public UserAuthDetailsDto getUserAuthDetailsByEmail(String email) {
        logger.info("Fetching authentication details for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        
        logger.debug("User {} isActive status during auth details fetch: {}", user.getEmail(), user.isActive());
        
        // FIX: Throw Spring Security specific exceptions for better handling
        if (!user.isActive()) {
            logger.warn("Authentication attempt failed for inactive user: {}. Throwing DisabledException.", user.getEmail());
            throw new DisabledException("Account is inactive. Please contact support or an administrator."); 
        }
        
        if (user.isBlocked()) { // Check if blocked in addition to inactive
            logger.warn("Authentication attempt failed for blocked user: {}. Throwing LockedException.", user.getEmail());
            // You can include blockedUntil in the message if you want.
            String blockedMessage = "Account is locked";
            if (user.getBlockedUntil() != null) {
                blockedMessage += " until " + user.getBlockedUntil() + ".";
            } else {
                blockedMessage += ". Please contact support or an administrator.";
            }
            throw new LockedException(blockedMessage);
        }

        return new UserAuthDetailsDto(
                user.getUserID(),
                user.getEmail(),
                user.getPassword(),
                user.getRoles().stream().map(role -> role.name()).collect(Collectors.toSet()),
                user.isActive(), 
                user.isBlocked()
        );
    }
}
