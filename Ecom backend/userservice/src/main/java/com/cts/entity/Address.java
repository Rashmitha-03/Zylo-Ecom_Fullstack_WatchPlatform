package com.cts.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    private String type; // e.g., HOME, WORK, BILLING, SHIPPING
    private boolean isDefault;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
