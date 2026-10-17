package com.cts.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.cts.config.ProductFC;
import com.cts.config.UserFC;
import com.cts.dto.CartDTO;
import com.cts.dto.CartItemDTO;
import com.cts.dto.CartItemResponse;
import com.cts.dto.CartSummaryResponse;
import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductStockDTO;
import com.cts.entity.Cart;
import com.cts.entity.CartItem;
import com.cts.exception.CartNotFoundException;
import com.cts.exception.InsufficientStockException;
import com.cts.exception.ProductNotFoundException;
import com.cts.exception.UserNotFoundException;
import com.cts.repository.CartItemRepository;
import com.cts.repository.CartRepository;

import feign.FeignException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CartServiceImpl implements ICartService {

	@Autowired
	private CartRepository cartRepository;
	@Autowired
	private CartItemRepository cartItemRepository;

	@Autowired
	private UserFC userFC;

	@Autowired
	private ProductFC productFC;

	@Autowired
	private ModelMapper modelMapper;
	private static final Logger logger = LoggerFactory.getLogger(CartServiceImpl.class);

	public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository,
			ModelMapper modelMapper) {
		this.cartRepository = cartRepository;
		this.cartItemRepository = cartItemRepository;
		this.modelMapper = modelMapper;
	}

	@Transactional
	@Override
	public CartDTO addProductToCart(int userId, CartItemDTO cartItemDto) {

		// 1. Validate user existence via User microservice
		logger.info("Validating user ID {} via User microservice", userId);
		try {
			ResponseEntity<Integer> response = userFC.getUserId(userId);
			if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
				throw new UserNotFoundException("User not found with ID: " + userId);
			}
		} catch (Exception e) {
			logger.error("User validation failed for ID {}: {}", userId, e.getMessage());
			throw new UserNotFoundException("User validation failed for ID: " + userId);
		}

		int productId = cartItemDto.getProductId();
		int requestedQty = cartItemDto.getQuantity();

		// 2. Check product existence from summaries
		logger.info("Checking product ID {} via Product microservice", productId);
		ProductCartDTO productDTO = productFC.getProductSummaries().stream().filter(p -> p.getProductID() == productId)
				.findFirst().orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));

		// 3. Check stock availability
		logger.info("Checking stock for product ID {}", productId);
		ProductStockDTO stockDTO = productFC.getProductStockAvailabity(productId);
		if (stockDTO.getAvailableStock() < requestedQty) {
			throw new InsufficientStockException("Insufficient stock for product ID " + productId + ". Available: "
					+ stockDTO.getAvailableStock() + ", Requested: " + requestedQty);
		}

		// 4. fetch cart
		Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
			logger.info("Creating new cart for user {}", userId);
			Cart newCart = new Cart();
			newCart.setUserId(userId);
			return cartRepository.save(newCart);
		});

		// 5. Add or update item in cart
		Optional<CartItem> existingItemOpt = cartItemRepository.findByCartAndProductId(cart, productId);
		if (existingItemOpt.isPresent()) {
			CartItem existingItem = existingItemOpt.get();
			int updatedQty = existingItem.getQuantity() + requestedQty;

			if (updatedQty > stockDTO.getAvailableStock()) {
				throw new InsufficientStockException("Cannot increase quantity beyond available stock. Available: "
						+ stockDTO.getAvailableStock() + ", Attempted: " + updatedQty);
			}

			existingItem.setQuantity(updatedQty);
			cartItemRepository.save(existingItem);
		} else {
			CartItem cartItem = modelMapper.map(cartItemDto, CartItem.class);
			cartItem.setCart(cart);
			cartItem.setProductName(productDTO.getName());
			cartItem.setProductPrice(productDTO.getPrice());
			cartItemRepository.save(cartItem);
		}

		// 6. Recalculate total cart price
		double totalPrice = cartItemRepository.findByCart(cart).stream()
				.mapToDouble(item -> item.getProductPrice() * item.getQuantity()).sum();

		cart.setTotalPrice(totalPrice);
		cartRepository.save(cart);
		return modelMapper.map(cart, CartDTO.class);
	}

	@Override
	@Transactional
	public CartDTO increaseProductQuantity(int userId, int productId, int quantityToAdd) {
		logger.info("Validating user ID {} via User microservice", userId);
		try {
			ResponseEntity<Integer> response = userFC.getUserId(userId);
			if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
				throw new UserNotFoundException("User not found with ID: " + userId);
			}
		} catch (FeignException.NotFound e) {
			throw new UserNotFoundException("User not found with ID: " + userId);
		} catch (FeignException e) {
			logger.error("Feign client error while validating user ID {}: {}", userId, e.getMessage());
			throw new UserNotFoundException("User validation failed due to service error for ID: " + userId);
		}

		logger.info("Request received: Increase quantity of product {} by {} for user {}", productId, quantityToAdd,
				userId);
		Cart cart = cartRepository.findByUserId(userId)
				.orElseThrow(() -> new CartNotFoundException("Cart not found for user: " + userId));
		CartItem cartItem = cartItemRepository.findByCartAndProductId(cart, productId)
				.orElseThrow(() -> new ProductNotFoundException("Product not found in cart!"));

		// Step: Check stock availability before updating
		ProductStockDTO stockDTO = productFC.getProductStockAvailabity(productId);
		int currentQty = cartItem.getQuantity();
		int updatedQty = currentQty + quantityToAdd;

		if (updatedQty > stockDTO.getAvailableStock()) {
			throw new InsufficientStockException("Not enough stock for product ID " + productId + ". Available: "
					+ stockDTO.getAvailableStock() + ", Attempted: " + updatedQty);
		}

		cartItem.setQuantity(updatedQty);
		cartItemRepository.save(cartItem);
		logger.info("Updated quantity for product {} in cart. New quantity: {}", productId, updatedQty);

		double totalPrice = cart.getCartItems().stream()
				.mapToDouble(item -> item.getProductPrice() * item.getQuantity()).sum();

		cart.setTotalPrice(totalPrice);
		cartRepository.save(cart);
		logger.debug("Cart updated for user {}. New total price: {}", userId, totalPrice);

		return modelMapper.map(cart, CartDTO.class);
	}

	@Override
	@Transactional
	public CartDTO decreaseProductQuantity(int userId, int productId, int quantityToRemove) {
		logger.info("Validating user ID {} via User microservice", userId);
		try {
			ResponseEntity<Integer> response = userFC.getUserId(userId);
			if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
				throw new UserNotFoundException("User not found with ID: " + userId);
			}
		} catch (FeignException.NotFound e) {
			throw new UserNotFoundException("User not found with ID: " + userId);
		} catch (FeignException e) {
			logger.error("Feign client error while validating user ID {}: {}", userId, e.getMessage());
			throw new UserNotFoundException("User validation failed due to service error for ID: " + userId);
		}
		logger.info("Request received: Decrease quantity of product {} by {} for user {}", productId, quantityToRemove,
				userId);
		Cart cart = cartRepository.findByUserId(userId)
				.orElseThrow(() -> new CartNotFoundException("Cart not found for user: " + userId));
		CartItem cartItem = cartItemRepository.findByCartAndProductId(cart, productId)
				.orElseThrow(() -> new ProductNotFoundException("Product not found in cart!"));

		// Decrease quantity or remove item if it reaches zero
		if (cartItem.getQuantity() > quantityToRemove) {
			cartItem.setQuantity(cartItem.getQuantity() - quantityToRemove);
			logger.info("Updated quantity for product {} in cart. New quantity: {}", productId, cartItem.getQuantity());
		} else {
			// If quantity <= quantityToRemove, remove the product from both DB and cart
			logger.info("Removing product {} from cart since quantity reached zero for user {}", productId, userId);
			cartItemRepository.delete(cartItem);
			cart.getCartItems().remove(cartItem); // Ensure removal from cart's list
		}
		// Recalculate total price only after removal or update
		double totalPrice = cart.getCartItems().stream()
				.mapToDouble(item -> item.getProductPrice() * item.getQuantity()).sum();
		cart.setTotalPrice(totalPrice);
		cartRepository.save(cart); // Persist updated cart
		logger.debug("Cart updated for user {}. New total price: {}", userId, totalPrice);

		return modelMapper.map(cart, CartDTO.class);
	}


	@Override
	public void removeProductFromCart(int userId, int productId) {
	    logger.info("Validating user ID {} via User microservice", userId);
	    try {
	        ResponseEntity<Integer> userResponse = userFC.getUserId(userId);
	        if (!userResponse.getStatusCode().is2xxSuccessful() || userResponse.getBody() == null) {
	            throw new UserNotFoundException("User not found with ID: " + userId);
	        }
	    } catch (FeignException.NotFound e) {
	        throw new UserNotFoundException("User not found with ID: " + userId);
	    } catch (FeignException e) {
	        logger.error("Feign client error while validating user ID {}: {}", userId, e.getMessage());
	        throw new UserNotFoundException("User validation failed due to service error for ID: " + userId);
	    }

	    Cart cart = cartRepository.findByUserId(userId)
	        .orElseThrow(() -> new CartNotFoundException("Cart not found for user: " + userId));

	    boolean productExists = cart.getCartItems().stream()
	        .anyMatch(item -> item.getProductId() == productId);

	    if (!productExists) {
	        throw new ProductNotFoundException("Product with ID " + productId + " not found in the cart");
	    }

	    // Remove the product
	    cart.getCartItems().removeIf(item -> item.getProductId() == productId);

	    // Recalculate the total price after product removal
	    double updatedTotal = cart.getCartItems().stream()
	        .mapToDouble(item -> item.getProductPrice() * item.getQuantity())
	        .sum();

	    cart.setTotalPrice(updatedTotal);
	    cartRepository.save(cart);
	}


	@Override
	public void clearCart(int userId) {
		logger.info("Request received: Clearing cart for user {}", userId);
		Cart cart = cartRepository.findByUserId(userId)
				.orElseThrow(() -> new CartNotFoundException("Cart not found for user: " + userId));
		logger.info("Clearing {} items from cart for user {}", cart.getCartItems().size(), userId);
		cart.getCartItems().clear();
		cart.setTotalPrice(0.0);
		cartRepository.save(cart);
		logger.debug("Cart successfully cleared for user {}", userId);
	}

	@Override
	public double calculateTotalPrice(int userId) {
		logger.info("Calculating total price for cart of user {}", userId);
		Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> {
			logger.error("Cart not found for user: {}", userId);
			return new CartNotFoundException("Cart not found for user: " + userId);
		});
		double totalPrice = cart.getCartItems().stream().filter(item -> item != null) // Ensure we only process valid
				.mapToDouble(item -> item.getProductPrice() * item.getQuantity()).sum();
		logger.debug("Total price computed for user {}: {}", userId, totalPrice);
		return totalPrice;
	}

	@Override
	public CartDTO createCartForUser(int userId) {
		logger.info("Request received: Creating cart for user {}", userId);
		if (cartRepository.findByUserId(userId).isPresent()) {
			logger.warn("Cart already exists for user {}", userId);
			throw new RuntimeException("Cart already exists for user: " + userId);
		}
		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setTotalPrice(0.0);
		cartRepository.save(cart);
		logger.debug("Cart successfully created for user {}", userId);
		return modelMapper.map(cart, CartDTO.class);
	}

	public CartDTO convertToDto(Cart cart) {
		return modelMapper.map(cart, CartDTO.class);
	}

	@Override
	public double getTotalPriceForCart(int userId) {
		logger.info("Fetching total price for cart of user {}", userId);
		Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> {
			logger.error("Cart not found for user {}", userId);
			return new CartNotFoundException("Cart not found for user: " + userId);
		});
		double totalPrice = cart.getTotalPrice();
		logger.debug("Total price retrieved for user {}: {}", userId, totalPrice);
		return totalPrice;
	}

//	@Override
//	public List<CartItemDTO> getCartItems(int userId) {
//		logger.info("Fetching cart items for user {}", userId);
//		Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> {
//			logger.error("Cart not found for user {}", userId);
//			return new CartNotFoundException("Cart not found for user: " + userId);
//		});
//		List<CartItemDTO> cartItems = cart.getCartItems().stream().map(item -> modelMapper.map(item, CartItemDTO.class))
//				.collect(Collectors.toList());
//		logger.debug("Retrieved {} items for user {}", cartItems.size(), userId);
//		return cartItems;
//	}
	
	@Override
	public List<CartItemDTO> getCartItems(int userId) {
	    logger.info("Fetching cart items for user {}", userId);
	    Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> {
	        logger.error("Cart not found for user {}", userId);
	        throw new CartNotFoundException("Cart not found for user: " + userId);
	    });
 
	    List<CartItemDTO> validItems = new ArrayList<>();
 
	    for (CartItem item : cart.getCartItems()) {
	        try {
	            // Check if product still exists
	            ProductCartDTO product = productFC.getProductSummaries().stream()
	                .filter(p -> p.getProductID() == item.getProductId())
	                .findFirst()
	                .orElseThrow(() -> new ProductNotFoundException("Product " + item.getProductId() + " no longer exists"));
 
	            // Only add if product is valid
	            validItems.add(modelMapper.map(item, CartItemDTO.class));
	        } catch (ProductNotFoundException e) {
	            logger.warn("Skipping deleted product ID {} from cart", item.getProductId());
	        } catch (Exception e) {
	            logger.error("Error checking product availability: {}", e.getMessage());
	        }
	    }
 
	    logger.debug("Returning {} valid items for user {}", validItems.size(), userId);
	    return validItems;
	}
 

	@Override
	public CartSummaryResponse getCartBreakdownForUser(int userId) {
		Cart cart = cartRepository.findByUserId(userId)
				.orElseThrow(() -> new CartNotFoundException("Cart not found for user: " + userId));
		List<CartItemResponse> items = cart.getCartItems().stream().filter(Objects::nonNull).map(item -> {
			double subtotal = item.getProductPrice() * item.getQuantity();
			return new CartItemResponse(item.getProductName(), item.getProductPrice(), item.getQuantity(), subtotal);
		}).collect(Collectors.toList());
		double total = items.stream().mapToDouble(CartItemResponse::getSubtotal).sum();
		return new CartSummaryResponse(items, total);
	}
	
	public void updateGrandTotal(int userId, Double grandTotal) {
	    Optional<Cart> optionalCart = cartRepository.findByUserId(userId);
	    if (optionalCart.isPresent()) {
	        Cart cart = optionalCart.get(); // unwrap it safely
	        cart.setGrandTotal(grandTotal); // now you can call the method
	        cartRepository.save(cart);
	    } else {
	        throw new RuntimeException("Cart not found for userId: " + userId);
	    }
	}



}
