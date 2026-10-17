package com.cts.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
 
@Entity
@Data
@Table(name="orderCartItem")
public class CartItem {
 
    @Id
    private  int id;
    private int productId;
    private int quantity;
    
    private String status = "Placed";
    
    private String orderId;
    
    
 
 
}