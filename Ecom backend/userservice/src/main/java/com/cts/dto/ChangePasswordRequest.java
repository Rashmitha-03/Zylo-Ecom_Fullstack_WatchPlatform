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
public class ChangePasswordRequest {

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Old password cannot be empty")
    // Note: We typically don't apply complex regex or size for oldPassword here,
    // as its validity will be checked against the stored hash in the service layer.
    // However, a basic size constraint can prevent excessively long invalid inputs.
    @Size(min = 8, max = 30, message = "Old password must be between 8 and 30 characters")
    private String oldPassword;

    @NotBlank(message = "New password cannot be empty")
    @Size(min = 8, max = 30, message = "New password must be between 8 and 30 characters")
    // This regex requires at least one digit, one lowercase, one uppercase, one special character, no whitespace.
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?`~]).{8,30}$",
             message = "New password must contain at least one digit, one lowercase, one uppercase, and one special character.")
    private String newPassword;
}