package com.cts.dto;

import lombok.Data;

@Data
public class AddressDTO {
    private Long id;
    private Long userId;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;
}
