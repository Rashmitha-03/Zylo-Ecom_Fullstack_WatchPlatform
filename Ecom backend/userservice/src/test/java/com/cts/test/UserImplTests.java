package com.cts.test;

import com.cts.dto.*;
import com.cts.entity.User;
import com.cts.enums.Role;

import com.cts.repository.UserRepository;
import com.cts.service.UserServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserImplTests {

    @InjectMocks
    private UserServiceImpl userService;

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private ModelMapper modelMapper;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserID(1);
        user.setEmail("test@example.com");
        user.setPassword("encodedPass");
        user.setLoginAttempts(0);
        user.setBlocked(false);
        user.setActive(true);
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("test@example.com", "password");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);

        String result = userService.login(request);

        assertEquals("Login successful", result);
        verify(userRepository).save(user);
    }

    @Test
    void testRegisterUser_Success() {
    	RegisterRequest request = new RegisterRequest(
    		    "Jane",                  // firstName
    		    "Doe",                   // lastName
    		    "jane@example.com",      // email
    		    "secret",                // password
    		    "9876543210",            // phoneNumber
    		    LocalDate.of(1995, 5, 15), // dateOfBirth
    		    "Female",                 // gender
    		    "some_random_img_url"
    		);
        User newUser = new User();
        newUser.setEmail("jane@example.com");
        newUser.setPassword("encoded");
        newUser.setRoles(Set.of(Role.USER));

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(modelMapper.map(request, User.class)).thenReturn(newUser);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded");

        RegisterResponse response = userService.registerUser(request);

        assertEquals("User registered successfully", response.getMessage());
    }

    @Test
    void testGetUserById() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        UserProfileResponse response = new UserProfileResponse();
        when(modelMapper.map(user, UserProfileResponse.class)).thenReturn(response);

        UserProfileResponse result = userService.getUserById(1);

        assertNotNull(result);
    }

    @Test
    void testGetAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        List<UserSummaryResponse> result = userService.getAllUsers();

        assertEquals(1, result.size());
    }

    @Test
    void testChangePassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setEmail("test@example.com");
        request.setNewPassword("newPass");
        request.setOldPassword("oldPass"); // even if not used in method

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("encoded");

        userService.changePassword(request);

        verify(userRepository).save(user);
    }


    @Test
    void testForgotPassword() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("test@example.com");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        userService.forgotPassword(request);

        verify(userRepository).save(user);
        assertTrue(user.getVerificationToken().startsWith("token-"));
    }

    @Test
    void testResetPassword() {
        ResetPasswordRequest request = new ResetPasswordRequest("test@example.com", user.getVerificationToken(), "newPass");
        user.setVerificationToken("token123");
        request.setToken("token123");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("encoded");

        userService.resetPassword(request);

        assertNull(user.getVerificationToken());
    }

    @Test
    void testRecoverAccount() {
        AccountRecoveryRequest request = new AccountRecoveryRequest("test@example.com", "secret");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("encoded");

        userService.recoverAccount(request);

        assertTrue(user.isActive());
        verify(userRepository).save(user);
    }

    @Test
    void testGetBlockStatus() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        UserBlockStatusResponse response = userService.getBlockStatus("test@example.com");

        assertNotNull(response);
        assertFalse(response.isBlocked());
    }

    @Test
    void testUnlockUser() {
        user.setBlocked(true);
        user.setLoginAttempts(2);
        user.setBlockedUntil(LocalDateTime.now().plusMinutes(5));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        userService.unlockUser("test@example.com");

        assertFalse(user.isBlocked());
        assertNull(user.getBlockedUntil());
        assertEquals(0, user.getLoginAttempts());
    }

    @Test
    void testAssignRoles() {
        RoleAssignmentRequest request = new RoleAssignmentRequest();
        request.setUserId(1);
        request.setRoles(Set.of(Role.USER, Role.ADMIN));

        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        userService.assignRoles(request);

        assertTrue(user.getRoles().contains(Role.ADMIN));
        verify(userRepository).save(user);
    }

    @Test
    void testUpdateUserStatus() {
        UserStatusUpdateRequest request = new UserStatusUpdateRequest(true, false);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        userService.updateUserStatus(1, request);

        assertTrue(user.isActive());
        assertFalse(user.isBlocked());
        verify(userRepository).save(user);
    }

    @Test
    void testDeleteUser() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        userService.softdeleteUser(1);

        assertFalse(user.isActive());
        verify(userRepository).save(user);
    }
}
