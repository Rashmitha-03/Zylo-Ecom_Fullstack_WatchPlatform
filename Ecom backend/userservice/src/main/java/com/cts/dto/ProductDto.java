package com.cts.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProductDto {
	
    private int productID;
    private String name;
    private String description;
    private Double price;
    private String gender;
    private String color;
    private String material;
    private String type;
    private String imageURL;
    
}
