// src/main/java/com/cts/dto/UserSummaryResponse.java (CORRECTED DTO - FINAL)
package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List; // <--- IMPORTANT: This import is needed for 'List<String> roles'

@Data // Generates getters, setters, toString, equals, hashCode
@AllArgsConstructor // Generates a constructor with all fields
@NoArgsConstructor // Generates a no-argument constructor
public class UserSummaryResponse {
    private int userID;
    private String firstName;
    private String lastName;
    private String email;
    private boolean active;  // Maps to isActive from your User entity
    private boolean blocked; // <--- ADD THIS FIELD (maps to isBlocked from User entity)
    private List<String> roles; // <--- ADD THIS FIELD (maps to roles from User entity)
}