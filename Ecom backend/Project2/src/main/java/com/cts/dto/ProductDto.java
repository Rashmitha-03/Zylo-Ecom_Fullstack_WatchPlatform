package com.cts.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProductDto {
	
    private int productID;
    private String name;
    private String shortdescription;
	private String longdescription;
    private Double price;
    private String gender;
    private String color;
    private String material;
    private String type;
    private String imageURL;
    private double avgRating;
    private int stock;
    private boolean active;



    
    public ProductDto(int productID, String name, double price) {
        this.productID = productID;
        this.name = name;
        this.price = price;
    }

}
