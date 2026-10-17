// src/main/java/com/cts/dto/UserProfileResponse.java (UPDATED with Timestamps)
package com.cts.dto;

import com.cts.enums.Role;
import com.cts.enums.MembershipLevel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime; // <--- NEW IMPORT for LocalDateTime
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private int userID;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String profileimg;
    private LocalDate dateOfBirth;
    private String gender;
    private Set<Role> roles;
    private MembershipLevel membershipLevel;
    private boolean isActive;
    private boolean isBlocked;
    
    // NEW: Add timestamp fields
    private LocalDateTime createdAt;   // Maps to User entity's createdAt
    private LocalDateTime updatedAt;   // Maps to User entity's updatedAt
    private LocalDateTime lastLogin;   // Maps to User entity's lastLogin (if you add it)
    private LocalDateTime blockedUntil; // Maps to User entity's blockedUntil
}
