package com.cts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive; // Added for 'id' field
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAddressRequest {

    @Positive(message = "Address ID must be a positive number")
    private int id;

    @NotBlank(message = "Street cannot be empty")
    @Size(min = 3, max = 255, message = "Street must be between 3 and 255 characters")
    private String street;

    @NotBlank(message = "City cannot be empty")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]+$", message = "City can only contain letters, spaces, or hyphens")
    private String city;

    @NotBlank(message = "State cannot be empty")
    @Size(min = 2, max = 100, message = "State must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]+$", message = "State can only contain letters, spaces, or hyphens")
    private String state;

    @NotBlank(message = "Postal code cannot be empty")
    @Size(min = 3, max = 20, message = "Postal code must be between 3 and 20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-]+$", message = "Postal code can only contain letters, numbers, spaces, or hyphens")
    private String postalCode;

    @NotBlank(message = "Country cannot be empty")
    @Size(min = 2, max = 100, message = "Country must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]+$", message = "Country can only contain letters, spaces, or hyphens")
    private String country;

    @NotBlank(message = "Address type cannot be empty")
    @Size(min = 3, max = 50, message = "Address type must be between 3 and 50 characters")
    // Consider using @Pattern or an Enum for specific types like "SHIPPING", "BILLING", "HOME", "WORK"
    // Example: @Pattern(regexp = "SHIPPING|BILLING|HOME|WORK", message = "Address type must be one of: SHIPPING, BILLING, HOME, WORK")
    private String type;

    // Booleans do not typically require @NotNull or other validation annotations
    // as they inherently have a default value (false) and are always "valid" in terms of nullability.
    private boolean isDefault;
}