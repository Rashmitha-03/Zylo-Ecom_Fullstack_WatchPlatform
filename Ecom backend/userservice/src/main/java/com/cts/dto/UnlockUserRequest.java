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
public class UnlockUserRequest {

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    // Assuming adminNote is optional, but if provided, it should meet size constraints.
    // If adminNote is mandatory, change to @NotBlank and potentially add @Size.
    @Size(max = 500, message = "Admin note cannot exceed 500 characters")
    // If you wanted to ensure it's not just whitespace if present:
    // @Pattern(regexp = "^(?!\\s*$).+", message = "Admin note cannot be just whitespace")
    private String adminNote;
}