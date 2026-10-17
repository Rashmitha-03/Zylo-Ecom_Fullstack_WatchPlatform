package com.cts.dto;

import com.cts.enums.MembershipLevel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MembershipStatusResponse {
    private MembershipLevel membershipLevel;
    private String status;
}


