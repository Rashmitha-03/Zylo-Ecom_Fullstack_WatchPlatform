package com.cts.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cts.dto.FeedbackDto;
import com.cts.dto.ProductAddDTO;
import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductDto;
import com.cts.dto.ProductStockDTO;
import com.cts.entity.Feedback;
import com.cts.entity.Product;
import com.cts.exception.ResourceNotFoundException;
import com.cts.repository.ProductRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {

	private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);

	@Autowired
	ProductRepository productRepository;

	@Autowired
	ModelMapper modelMapper;

	public ProductDto convertToDTO(Product product) {
	    ProductDto dto = modelMapper.map(product, ProductDto.class);
	    List<Feedback> feedbacks = product.getFeedbacks();
	    
	    if (feedbacks != null && !feedbacks.isEmpty()) {
	        double average = feedbacks.stream()
	            .mapToInt(Feedback::getRating)
	            .average()
	            .orElse(0.0);
	        dto.setAvgRating(average);
	    } else {
	        dto.setAvgRating(0.0); // No feedbacks yet = zero rating
	    }
	    return dto;
	}


	private Product convertToEntity(ProductDto dto) {
		logger.debug("Converting Product DTO to entity: {}", dto);
		return modelMapper.map(dto, Product.class);
	}

	private ProductCartDTO convertToCartDTO(Product product) {
		logger.debug("Converting Product entity to DTO: {}", product);
		return modelMapper.map(product, ProductCartDTO.class);
	}

	private Product convertToCartEntity(ProductCartDTO dto) {
		logger.debug("Converting Product DTO to entity: {}", dto);
		return modelMapper.map(dto, Product.class);
	}

	private ProductAddDTO convertToDTOforAdd(Product product) {
		logger.debug("Converting Product entity to AddDTO: {}", product);
		return modelMapper.map(product, ProductAddDTO.class);
	}

	private Product convertToEntityforAdd(ProductAddDTO dto) {
		logger.debug("Converting Product AddDTO to entity: {}", dto);
		return modelMapper.map(dto, Product.class);
	}

	public ProductDto addProduct(ProductAddDTO productAddDTO) {
		logger.info("Adding new product: {}", productAddDTO);
		Product product = productRepository.save(convertToEntityforAdd(productAddDTO));
		logger.info("Product added successfully: {}", product);
		return convertToDTO(product);
	}

	public ProductDto updateProduct(int id, ProductAddDTO productAddDTO) {
		logger.info("Updating product with ID: {}", id);
		Product product = productRepository.findById(id).orElseThrow(() -> {
			logger.error("Product not found with ID: {}", id);
			return new ResourceNotFoundException("Product not found");
		});

		product.setName(productAddDTO.getName());
		product.setShortdescription(productAddDTO.getShortdescription());
		product.setLongdescription(productAddDTO.getLongdescription());
		product.setPrice(productAddDTO.getPrice());
		product.setGender(productAddDTO.getGender());
		product.setColor(productAddDTO.getColor());
		product.setMaterial(productAddDTO.getMaterial());
		product.setType(productAddDTO.getType());
		product.setImageURL(productAddDTO.getImageURL());
		product.setStock(productAddDTO.getStock());

		logger.debug("Product updated successfully: {}", product);
		return convertToDTO(productRepository.save(product));
	}

	public String deleteProduct(int id) {
	    logger.info("Attempting to delete product with ID: {}", id);

	    if (!productRepository.existsById(id)) {
	        logger.error("Product not found with ID: {}", id);
	        throw new ResourceNotFoundException("Product not found");
	    }

	    productRepository.deleteById(id);
	    logger.info("Product deleted successfully with ID: {}", id);
	    return "Deleted Successfully";
	}


	@Override
	public ProductDto getProductById(int id) {
		logger.info("Fetching product with ID: {}", id);
		Product product = productRepository.findById(id).filter(Product::isActive) // Ensures only active products are
																					// fetched
				.orElseThrow(() -> {
					logger.error("Product not found or deleted with ID: {}", id);
					return new ResourceNotFoundException("Product not found or deleted");
				});

		logger.info("Product fetched successfully: {}", product);
		return convertToDTO(product);
	}

	public ProductCartDTO getProductForCart(int id) {
		logger.info("Fetching product with ID: {}", id);
		Product product = productRepository.findById(id).filter(Product::isActive) // Ensures only active products are
																					// fetched
				.orElseThrow(() -> {
					logger.error("Product not found or deleted with ID: {}", id);
					return new ResourceNotFoundException("Product not found or deleted");
				});

		logger.info("Product fetched successfully: {}", product);
		return convertToCartDTO(product);
	}

	@Override
	public List<ProductDto> getAllProducts() {
		logger.info("Fetching all active products");
		List<ProductDto> products = productRepository.findAllActiveProducts().stream().map(this::convertToDTO)
				.collect(Collectors.toList());

		logger.info("Total active products fetched: {}", products.size());
		
		
		return products;
	}

	public List<ProductDto> filterByAttribute(Double minPrice, Double maxPrice, String type, String gender,
			String color, String material, String name) {
		logger.info(
				"Filtering products with parameters - Min Price: {}, Max Price: {}, Type: {}, Gender: {}, Color: {}, Material: {}, Name: {}",
				minPrice, maxPrice, type, gender, color, material, name);

		List<ProductDto> filteredProducts = productRepository.findActiveProductsByPriceRange(minPrice, maxPrice)
				.stream()
				.filter(p -> (type == null || p.getType().equalsIgnoreCase(type))
						&& (gender == null || p.getGender().equalsIgnoreCase(gender))
						&& (color == null || p.getColor().equalsIgnoreCase(color))
						&& (material == null || p.getMaterial().equalsIgnoreCase(material))
						&&(name == null || (p.getName() != null && p.getName().toLowerCase().contains(name.toLowerCase()))))

				.map(this::convertToDTO).collect(Collectors.toList());

		logger.info("Total filtered products found: {}", filteredProducts.size());
		return filteredProducts;
	}

	public List<ProductDto> searchByName(String keyword) {
		logger.info("Searching products by keyword: {}", keyword);

		List<ProductDto> results = productRepository.findByNameContainingIgnoreCase(keyword).stream()
				.map(this::convertToDTO).collect(Collectors.toList());

		logger.info("Total products found matching '{}': {}", keyword, results.size());
		return results;
	}

	@Override
	@Transactional
	public String softDeleteProduct(int id) {
		logger.info("Attempting to soft delete product with ID: {}", id);
		Product product = productRepository.findById(id).orElseThrow(() -> {
			logger.error("Product not found for soft delete, ID: {}", id);
			return new ResourceNotFoundException("Product not found");
		});

		product.setActive(false);
		productRepository.save(product);

		logger.info("Product soft-deleted successfully, ID: {}", id);
		return "Product soft-deleted successfully.";
	}

	@Override
	@Transactional
	public String restoreProduct(int id) {
		logger.info("Attempting to restore product with ID: {}", id);
		Product product = productRepository.findById(id).orElseThrow(() -> {
			logger.error("Product not found for restoration, ID: {}", id);
			return new ResourceNotFoundException("Product not found");
		});

		product.setActive(true);
		productRepository.save(product);

		logger.info("Product restored successfully, ID: {}", id);
		return "Product restored successfully.";
	}

	public String addFeedback(int productID, FeedbackDto feedbackDto) {
	    logger.info("Adding feedback for product ID: {}", productID);
	    Product product = productRepository.findById(productID).orElseThrow(() -> {
	        logger.error("Product not found for feedback, ID: {}", productID);
	        return new ResourceNotFoundException("Product not found");
	    });

	    // Validate the rating
	    int rating = feedbackDto.getRating();
	    if (rating < 1 || rating > 5) {
	        logger.error("Invalid rating: {}. Rating must be between 1 and 5.", rating);
	        return "Error: Rating must be between 1 and 5."; // Avoiding exception, returning response
	    }

	    Feedback feedback = new Feedback();
	    feedback.setProduct(product);
	    feedback.setReviewText(feedbackDto.getReviewText());
	    feedback.setRating(rating);

	    product.getFeedbacks().add(feedback);
	    productRepository.save(product);

	    logger.info("Feedback added successfully for product ID: {}", productID);
	    return "Feedback added successfully!";
	}


	public List<FeedbackDto> getFeedbackByProduct(int productID) {
		logger.info("Fetching feedback for product ID: {}", productID);
		Product product = productRepository.findById(productID).orElseThrow(() -> {
			logger.error("Product not found for feedback retrieval, ID: {}", productID);
			return new ResourceNotFoundException("Product not found");
		});

		List<FeedbackDto> feedbackList = product.getFeedbacks().stream().map(
				feedback -> new FeedbackDto(feedback.getReviewText(), feedback.getRating(), feedback.getCreatedTime()))
				.collect(Collectors.toList());

		logger.info("Total feedback items retrieved: {}", feedbackList.size());
		return feedbackList;
	}

	@Transactional
	public void reduceStock(int productId, int quantity) {
		logger.info("Reducing stock for product ID: {} by quantity: {}", productId, quantity);
		Product product = productRepository.findById(productId).orElseThrow(() -> {
			logger.error("Product not found for stock reduction, ID: {}", productId);
			return new ResourceNotFoundException("Product not found");
		});

		if (product.getStock() >= quantity) {
			product.setStock(product.getStock() - quantity);
			productRepository.save(product);
			logger.info("Stock reduced successfully, Product ID: {}", productId);
		} else {
			logger.error("Insufficient stock available for product ID: {}", productId);
			throw new IllegalArgumentException("Insufficient stock available");
		}
	}

	@Transactional
	public void updateStock(int productId, int quantity) {
		logger.info("Updating stock for product ID: {} by quantity: {}", productId, quantity);
		Product product = productRepository.findById(productId).orElseThrow(() -> {
			logger.error("Product not found for stock update, ID: {}", productId);
			return new ResourceNotFoundException("Product not found");
		});

		product.setStock(product.getStock() + quantity);
		productRepository.save(product);

		logger.info("Stock updated successfully, Product ID: {}", productId);
	}

	// check availability
	@Override
	public ProductStockDTO getProductStockAvailabity(Integer productId) {
		logger.info("Checking stock for product ID: {}", productId);

		Product product = productRepository.findByProductIDAndActiveTrue(productId).orElseThrow(() -> {
			logger.error("Active product not found, ID: {}", productId);
			return new ResourceNotFoundException("Product not found or inactive");
		});

		ProductStockDTO dto = new ProductStockDTO();
		dto.setProductId(product.getProductID());
		dto.setAvailableStock(product.getStock());

		logger.info("Stock info for product ID {}: {}", productId, dto.getAvailableStock());
		return dto;
	}

	@Override
	public List<ProductCartDTO> getProductSummaries() {
		return productRepository.findAllActiveProducts().stream().map(product -> {
			ProductCartDTO dto = new ProductCartDTO();
			dto.setProductID(product.getProductID());
			dto.setName(product.getName());
			dto.setPrice(product.getPrice());
			return dto;
		}).collect(Collectors.toList());
	}
	
	public List<ProductDto> getAllProductsForAdmin() {
	    logger.info("Fetching all products (active + inactive)");
	    return productRepository.findAll().stream()
	        .map(this::convertToDTO)
	        .collect(Collectors.toList());
	}


}