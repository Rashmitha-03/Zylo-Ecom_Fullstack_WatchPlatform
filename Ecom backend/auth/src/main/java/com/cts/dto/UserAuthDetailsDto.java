package com.cts.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthDetailsDto {
 private String username;
 private String email;
 private String password; // This should be the encoded password from the database
 private List<String> roles; // List of role names (e.g., "ADMIN", "USER")
 // Add other fields from your User entity if needed, e.g., userId
 private Integer userId; // Optional, but useful for propagation later
}