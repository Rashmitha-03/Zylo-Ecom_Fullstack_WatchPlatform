package com.cts.entity;


import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name="orderservice")
public class Order {

@Id
private String orderId;
private int userId;
private int productId; // Add this field
private String productName;
private String orderStatus;
private String paymentMethod;
private Long paymentId;
private String paymentStatus;
private LocalDateTime orderTime;
private double orderAmount;
private String refundStatus;
private int addressId;
private int quantity;
private double totalPrice;
    public Order() {
        this.orderTime = LocalDateTime.now();
       
    }
    
    

}

