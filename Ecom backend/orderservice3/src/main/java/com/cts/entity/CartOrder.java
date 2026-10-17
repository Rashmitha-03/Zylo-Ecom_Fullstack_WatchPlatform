package com.cts.entity;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
 
import lombok.Data;
 
@Entity
@Data
public class CartOrder {
 
    @Id
    private String orderId;
 
    private int userId;
 
    private int addressId;
 
    private double totalPrice;
 
    private LocalDateTime orderTime;
    
   
 
    private String paymentMethod;
    private Long paymentId;

 
    private String orderStatus;
    private String paymentStatus;
    private String refundStatus;
 
 
//@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//@JoinColumn(name = "order_id", referencedColumnName = "orderId")
//private List<CartItem> items;
// 
 
}
 
 