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
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token cannot be empty")
    @Size(min = 10, max = 255, message = "Reset token must be between 10 and 255 characters")
    // If your token has a specific format (e.g., UUID), you can add a @Pattern here.
    // For example: @Pattern(regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", message = "Invalid token format")
    private String token;

    @NotBlank(message = "New password cannot be empty")
    @Size(min = 8, max = 30, message = "New password must be between 8 and 30 characters")
    // This regex requires at least one digit, one lowercase, one uppercase, one special character, no whitespace.
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?`~]).{8,30}$",
             message = "New password must contain at least one digit, one lowercase, one uppercase, and one special character.")
    private String newPassword;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;
}