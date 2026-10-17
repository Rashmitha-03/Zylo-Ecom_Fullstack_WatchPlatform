package com.cts.dto;

import java.util.List;
 
import lombok.Data;
 
@Data
public class CartClientDTO {
    private int userId;
    private String orderId;
    private List<CartItemDTO> items; 
    private double totalPrice;
    private int addressId;

}
