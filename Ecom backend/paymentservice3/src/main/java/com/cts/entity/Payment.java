package com.cts.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

import org.springframework.data.domain.jaxb.SpringDataJaxb.OrderDto;
import org.springframework.http.ResponseEntity;

@Entity
@Data
public class Payment {
    @Id
    private Long paymentId;
    private String upiId;
    //private String name;
    private double amount;
    private LocalDateTime createdAt;
    private String status;
}
