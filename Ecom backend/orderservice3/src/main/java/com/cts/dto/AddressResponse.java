package com.cts.dto;

import lombok.Data;

@Data
public class AddressResponse {
    private int id;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String type;
    private boolean isDefault;
}
