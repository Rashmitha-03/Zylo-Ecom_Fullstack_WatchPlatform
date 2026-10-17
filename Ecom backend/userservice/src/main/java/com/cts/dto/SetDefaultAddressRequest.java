package com.cts.dto;

import jakarta.validation.constraints.Positive; // Import for @Positive
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SetDefaultAddressRequest {

    @Positive(message = "Address ID must be a positive number")
    private int addressId;

    @Positive(message = "User ID must be a positive number")
    private int userId;
}