package com.cts.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cts.entity.Product;

public interface ProductRepository extends JpaRepository<Product,Integer> {

	 List<Product> findByNameContainingIgnoreCase(String name);
	   List<Product> findByType(String type);
	   List<Product> findByGender(String gender);
	   List<Product> findByColor(String color);
	   List<Product> findByMaterial(String material);
	   
	   @Query("SELECT p FROM Product p WHERE p.active = true")
	   List<Product> findAllActiveProducts();

	   List<Product> findByActiveFalse();

	   @Modifying
	   @Query("UPDATE Product p SET p.active = false WHERE p.productID = :id")
	   void softDeleteProduct(@Param("id") int id);
	   
	   @Modifying
	   @Query("UPDATE Product p SET p.active = true WHERE p.productID = :id")
	   void restoreProduct(@Param("id") int id);
	   
//	   @Query("SELECT p FROM Product p WHERE p.active = true AND p.price BETWEEN :minPrice AND :maxPrice")
//	   List<Product> findActiveProductsByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
	   
	   
	   @Query("SELECT p FROM Product p WHERE p.active = true " +
		       "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
		       "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
		List<Product> findActiveProductsByPriceRange(@Param("minPrice") Double minPrice,
		                                             @Param("maxPrice") Double maxPrice);

	   
	   
	   Optional<Product> findByProductIDAndActiveTrue(Integer productID);

}
