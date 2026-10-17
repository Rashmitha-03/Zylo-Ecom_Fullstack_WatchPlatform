package com.cts.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent; // Added for more flexibility on dateOfBirth
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "First name cannot be empty")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]+$", message = "First name can only contain letters, spaces, or hyphens")
    private String firstName;

    @NotBlank(message = "Last name cannot be empty")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]+$", message = "Last name can only contain letters, spaces, or hyphens")
    private String lastName;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, max = 30, message = "Password must be between 8 and 30 characters")
    // This regex requires at least one digit, one lowercase, one uppercase, one special character, no whitespace.
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?`~]).{8,30}$",
             message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character.")
    private String password;

    @NotBlank(message = "Phone number cannot be empty")
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 digits")
    @Pattern(regexp = "^\\+?[0-9\\s\\-]+$", message = "Phone number can only contain digits, spaces, hyphens, and an optional leading '+'")
    private String phoneNumber;

    @NotNull(message = "Date of birth cannot be null")
    @Past(message = "Date of birth must be in the past") // Ensures the date is not today or in the future
    // If you need to ensure a minimum age (e.g., 18 years old), you'd typically implement a custom validator or check in the service layer.
    // Example: For 18+ years: @Past(message = "Date of birth must be in the past") and a custom validator to check age.
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender cannot be empty")
    @Pattern(regexp = "^(Male|Female|Other|Prefer not to say)$",
             message = "Gender must be 'Male', 'Female', 'Other', or 'Prefer not to say'")
    // Alternative: Use an Enum type for gender and apply @NotNull
    private String gender;
}