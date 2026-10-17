package com.cts.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, max = 30, message = "Password must be between 8 and 30 characters")
    // For login, we typically don't add complex regex patterns for the password
    // here. The actual password validation (matching against the stored hash)
    // happens in the service layer. A basic size constraint is usually sufficient
    // to prevent excessively long or empty inputs.
    private String password;
}