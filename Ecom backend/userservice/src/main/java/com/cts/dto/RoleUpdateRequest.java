package com.cts.dto;

import java.util.Set;

import com.cts.enums.Role;
import jakarta.validation.constraints.NotEmpty; // Import for @NotEmpty
import jakarta.validation.constraints.NotNull; // Import for @NotNull

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleUpdateRequest {

    @NotNull(message = "Roles set cannot be null")
    @NotEmpty(message = "Roles set cannot be empty; at least one role must be specified")
    // Note: Individual 'Role' enum values are implicitly validated during deserialization.
    // If an invalid string is sent for a role, it will typically result in a deserialization error
    // before validation even reaches this point.
    private Set<Role> roles;
}