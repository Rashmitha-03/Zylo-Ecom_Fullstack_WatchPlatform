package com.cts.dto;

import lombok.Data;

@Data
public class ProductSummary {
    private int productId;
    private String productName;
    private String status;
    
    private int quantity;

}
