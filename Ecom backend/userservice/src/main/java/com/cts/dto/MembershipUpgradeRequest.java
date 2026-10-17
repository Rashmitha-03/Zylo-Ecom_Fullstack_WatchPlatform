package com.cts.dto;

import com.cts.enums.MembershipLevel;
import jakarta.validation.constraints.NotNull; // Import for @NotNull

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MembershipUpgradeRequest {

    @NotNull(message = "Membership level cannot be null")
    private MembershipLevel membershipLevel;
}