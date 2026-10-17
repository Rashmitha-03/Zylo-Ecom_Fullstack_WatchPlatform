package com.cts.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginAttemptRequest {

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "IP Address cannot be empty")
    @Size(min = 7, max = 45, message = "IP Address must be between 7 and 45 characters") // Covers IPv4 (7-15) and IPv6 (up to 45)
    // Basic regex for IPv4 or IPv6 format validation.
    // This regex is a simplification and may not cover all edge cases but is generally sufficient.
    @Pattern(regexp = "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$",
             message = "IP Address must be a valid IPv4 or IPv6 format")
    private String ipAddress;

    // Booleans do not typically require @NotNull or other validation annotations
    // as they inherently have a default value (false) and are always "valid" in terms of nullability.
    private boolean successful;
}