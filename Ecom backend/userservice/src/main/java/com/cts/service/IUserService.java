
package com.cts.service;

import com.cts.dto.*;
import com.cts.entity.User;
import java.util.List;
import java.util.Optional;

public interface IUserService {

    // Registration and Login
    String login(LoginRequest request);
    RegisterResponse registerUser(RegisterRequest request);

    // Profile Management
    UserProfileResponse getUserById(int userId);
    List<UserSummaryResponse> getAllUsers();
    UserProfileResponse updateUserProfile(int userId, UpdateProfileRequest request);
    void changePassword(ChangePasswordRequest request);
    UserProfileResponse updateProfileImage(int userId, UpdateProfileImageRequest request);

    // Password Recovery
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void recoverAccount(AccountRecoveryRequest request);

    // Login Attempt Tracking
    void handleFailedLogin(String email);
    UserBlockStatusResponse getBlockStatus(String email);
    void unlockUser(String email);

    // Role and Status Management
    void assignRoles(RoleAssignmentRequest request);
    void updateUserStatus(int userId, UserStatusUpdateRequest request);

    // Delete User
    void softdeleteUser(int userId);
    void hardDeleteUser(int userId);
    
    
    //methods for feign client
    Integer getUserId(int userId);
    List<CartItemDTO> getUserCartItems(Integer userId);
    List<OrderDTO> getOrdersOfUser(int userId);
    
    //For authentication
    public Optional<User> findByEmail(String email);
    UserAuthDetailsDto getUserAuthDetailsByEmail(String email);

}
