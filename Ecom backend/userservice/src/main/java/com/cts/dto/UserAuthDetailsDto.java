package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set; // Changed from List to Set

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthDetailsDto {
    private Integer userId;
    private String email; // Renamed from username to email for clarity and consistency
    private String password; // This should be the encoded password from the database
    private Set<String> roles; // List of role names (e.g., "ADMIN", "USER")
    private boolean isActive; // Added to reflect user's active status
    private boolean isBlocked; // Added to reflect user's blocked status
}
