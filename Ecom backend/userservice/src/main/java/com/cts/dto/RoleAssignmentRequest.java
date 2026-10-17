package com.cts.dto;

import java.util.Set;

import com.cts.enums.Role;
import jakarta.validation.constraints.NotEmpty; // For collections
import jakarta.validation.constraints.NotNull; // For userId and collection itself
import jakarta.validation.constraints.Positive; // For userId

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleAssignmentRequest {

    // Removed email as per your DTO, using userId instead.
    // If you need email for lookup, it should be added and validated with @NotBlank and @Email.

    @NotNull(message = "User ID cannot be null") // For safety, though primitive int cannot be null
    @Positive(message = "User ID must be a positive number") // Ensures ID is greater than 0
    private int userId;

    @NotNull(message = "Roles cannot be null")
    @NotEmpty(message = "At least one role must be assigned")
    // Note: Individual 'Role' enum values are implicitly validated during deserialization.
    // If an invalid string is sent for a role, it will typically result in a deserialization error
    // before validation even reaches this point.
    private Set<Role> roles;
}