package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {

    // firstName and lastName are optional for update, but if provided, must meet size and pattern.
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]+$", message = "First name can only contain letters, spaces, or hyphens")
    private String firstName;

    @Size(min = 1, max = 50, message = "Last name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]+$", message = "Last name can only contain letters, spaces, or hyphens")
    private String lastName;

    // phoneNumber is optional for update, but if provided, must meet size and pattern.
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 digits")
    @Pattern(regexp = "^\\+?[0-9\\s\\-]+$", message = "Phone number can only contain digits, spaces, hyphens, and an optional leading '+'")
    private String phoneNumber;

    // dateOfBirth is optional for update, but if provided, must be in the past.
    // @NotNull is NOT used because null is allowed if not updating this field.
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // gender is optional for update, but if provided, must match specific values.
    @Pattern(regexp = "^(Male|Female|Other|Prefer not to say)$",
             message = "Gender must be 'Male', 'Female', 'Other', or 'Prefer not to say'")
    private String gender;
    private String profileimg;
}