package com.cts.service;

import java.util.List;

import com.cts.dto.FeedbackDto;
import com.cts.dto.ProductAddDTO;
import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductDto;
import com.cts.dto.ProductStockDTO;

public interface IProductService {

	ProductDto addProduct(ProductAddDTO productAddDTO);

	ProductDto updateProduct(int id, ProductAddDTO productAddDTO);

	String deleteProduct(int id);

	ProductDto getProductById(int id);

	List<ProductDto> getAllProducts();

	List<ProductDto> filterByAttribute(Double minPrice, Double maxPrice, String type, String gender, String color,
			String material, String name);

	List<ProductDto> searchByName(String keyword);

	String softDeleteProduct(int id); // Soft delete using `active = false`

	String restoreProduct(int id); // Restore soft-deleted product

	String addFeedback(int productID, FeedbackDto feedbackDto); // Add feedback for a product

	List<FeedbackDto> getFeedbackByProduct(int productID); // Fetch all feedback under a product

	void reduceStock(int productId, int quantity);

	void updateStock(int productId, int quantity);

	ProductCartDTO getProductForCart(int id);

	ProductStockDTO getProductStockAvailabity(Integer productId);

	List<ProductCartDTO> getProductSummaries();
	
	List<ProductDto> getAllProductsForAdmin();

}
