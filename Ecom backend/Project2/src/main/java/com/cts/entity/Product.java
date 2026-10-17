package com.cts.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "e_product")
@NoArgsConstructor
public class Product {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
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
	private int stock;

	@Column(nullable = false)
	private boolean active = true; // Default to active when created

	public void softDelete() {
		this.active = false; // Marks product as inactive
	}

	public void restore() {
		this.active = true; // Reactivates product
	}

	@Column(updatable = false)
	private LocalDateTime createdTime;

	@PrePersist
	protected void onCreate() {
		createdTime = LocalDateTime.now(); // Auto-sets creation time
	}

	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
	private List<Feedback> feedbacks; // Stores reviews for this product
	
	public Product(int productID, String name, Double price) {
	    this.productID = productID;
	    this.name = name;
	    this.price = price;
	}
	
	public Product(int productID, String name, int stock) {
	    this.productID = productID;
	    this.name = name;
	    this.stock = stock;
	}



}
