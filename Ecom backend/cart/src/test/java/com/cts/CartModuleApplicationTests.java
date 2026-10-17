package com.cts;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.cts.service.CartServiceImpl;
import feign.FeignException;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartModuleApplicationTests {

	@Mock
	private CartRepository cartRepository;
	@Mock
	private CartItemRepository cartItemRepository;
	@Mock
	private UserFC userFC;
	@Mock
	private ProductFC productFC;
	@Mock
	private ModelMapper modelMapper;

	@InjectMocks
	private CartServiceImpl cartService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);

	}

	// --- Shared Mocks for Valid User & Product Setup ---
	private void mockValidUser(Integer userId) {
		when(userFC.getUserId(userId)).thenReturn(new ResponseEntity<>(userId, HttpStatus.OK));
	}

	// --- Test Cases for addProductToCart ---

	@Test
	void testAddProductToCart() {
		int userId = 1;
		int productId = 101;
		int quantity = 2;
		CartItemDTO cartItemDTO = new CartItemDTO(productId, quantity);
		when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));
		ProductCartDTO productDTO = new ProductCartDTO(productId, "Item", 100.0);
		ProductStockDTO stockDTO = new ProductStockDTO(productId, 5);
		Cart newCart = new Cart();
		newCart.setUserId(userId);
		CartItem item = new CartItem();
		item.setProductId(productId);
		item.setProductPrice(100.0);
		item.setQuantity(quantity);
		newCart.setCartItems(List.of(item));
		when(productFC.getProductSummaries()).thenReturn(List.of(productDTO));
		when(productFC.getProductStockAvailabity(productId)).thenReturn(stockDTO);
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());
		when(cartRepository.save(any(Cart.class))).thenReturn(newCart);
		when(modelMapper.map(cartItemDTO, CartItem.class)).thenReturn(item);
		when(cartItemRepository.findByCartAndProductId(any(), eq(productId))).thenReturn(Optional.empty());
		when(cartItemRepository.findByCart(any())).thenReturn(List.of(item));
		when(modelMapper.map(any(Cart.class), eq(CartDTO.class))).thenReturn(new CartDTO());
		CartDTO result = cartService.addProductToCart(userId, cartItemDTO);
		assertNotNull(result);
		verify(cartRepository, atLeastOnce()).save(any(Cart.class));
	}

	@Test
	void testAddProductToCart_ExistingItemQuantityUpdated() {

		int userId = 42;
		int productId = 101;

		CartItemDTO dto = new CartItemDTO(productId, 2);
		ProductCartDTO productDTO = new ProductCartDTO(productId, "Book", 100.0);
		ProductStockDTO stockDTO = new ProductStockDTO(productId, 10);

		CartItem existing = new CartItem();
		existing.setProductId(productId);
		existing.setQuantity(3);
		existing.setProductPrice(100.0);

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(new ArrayList<>(List.of(existing)));

		when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));
		when(productFC.getProductSummaries()).thenReturn(List.of(productDTO));
		when(productFC.getProductStockAvailabity(productId)).thenReturn(stockDTO);
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
		when(cartItemRepository.findByCartAndProductId(cart, productId)).thenReturn(Optional.of(existing));
		when(cartItemRepository.findByCart(cart)).thenReturn(List.of(existing));
		when(cartRepository.save(cart)).thenReturn(cart);
		when(modelMapper.map(cart, CartDTO.class)).thenReturn(new CartDTO());

		CartDTO result = cartService.addProductToCart(userId, dto);

		assertNotNull(result);
		assertEquals(5, existing.getQuantity());
		verify(cartItemRepository).save(existing);
	}

	@Test
	void testAddProductToCart_UpdateFailsDueToStock() {
		int userId = 42;
		int productId = 101;

		CartItemDTO dto = new CartItemDTO(productId, 5);
		ProductCartDTO productDTO = new ProductCartDTO(productId, "Tablet", 400.0);
		ProductStockDTO stockDTO = new ProductStockDTO(productId, 7);

		CartItem existing = new CartItem();
		existing.setProductId(productId);
		existing.setQuantity(3);
		existing.setProductPrice(400.0);

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(List.of(existing));

		when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));
		when(productFC.getProductSummaries()).thenReturn(List.of(productDTO));
		when(productFC.getProductStockAvailabity(productId)).thenReturn(stockDTO);
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
		when(cartItemRepository.findByCartAndProductId(cart, productId)).thenReturn(Optional.of(existing));

		assertThrows(InsufficientStockException.class, () -> cartService.addProductToCart(userId, dto));
	}

	@Test
	void testAddProductToCart_UserNotFound() {
		int userId = 1;
		CartItemDTO cartItemDTO = new CartItemDTO(101, 2);
		lenient().when(userFC.getUserId(userId)).thenReturn(ResponseEntity.of(Optional.empty()));
		Exception exception = assertThrows(UserNotFoundException.class, () -> {
			cartService.addProductToCart(userId, cartItemDTO);
		});
		assertEquals("User validation failed for ID: 1", exception.getMessage());
	}

	@Test
	void testAddProductToCart_InsufficientStock() {
		int userId = 1;
		int productId = 101;
		int quantity = 10; // Requested quantity exceeds available stock
		CartItemDTO cartItemDTO = new CartItemDTO(productId, quantity);
		// Simulate user exists
		when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));
		// Simulate product exists
		ProductCartDTO productDTO = new ProductCartDTO(productId, "Tablet", 20000.0);
		when(productFC.getProductSummaries()).thenReturn(List.of(productDTO));
		// Simulate insufficient stock
		ProductStockDTO stockDTO = new ProductStockDTO(productId, 5); // Only 5 available
		when(productFC.getProductStockAvailabity(productId)).thenReturn(stockDTO);
		Exception exception = assertThrows(InsufficientStockException.class, () -> {
			cartService.addProductToCart(userId, cartItemDTO);
		});
		assertEquals("Insufficient stock for product ID 101. Available: 5, Requested: 10", exception.getMessage());
	}

	@Test
	void addProductToCart_UserValidationFailsDueToFeignException_ThrowsUserNotFoundException() {
		int userId = 1;
		CartItemDTO cartItemDto = new CartItemDTO(101, 2);

		when(userFC.getUserId(userId)).thenThrow(mock(FeignException.class)); // Simulate Feign client error

		UserNotFoundException thrown = assertThrows(UserNotFoundException.class,
				() -> cartService.addProductToCart(userId, cartItemDto));

		assertTrue(thrown.getMessage().contains("User validation failed for ID: " + userId));
		verify(productFC, never()).getProductSummaries(); // No product check
	}

	@Test
	void addProductToCart_ProductNotFoundInSummaries_ThrowsProductNotFoundException() {
		int userId = 1;
		int productId = 101;
		CartItemDTO cartItemDto = new CartItemDTO(productId, 2);

		mockValidUser(userId);
		when(productFC.getProductSummaries()).thenReturn(Collections.emptyList()); // Product not in summaries

		ProductNotFoundException thrown = assertThrows(ProductNotFoundException.class,
				() -> cartService.addProductToCart(userId, cartItemDto));

		assertEquals("Product not found with ID: " + productId, thrown.getMessage());
		verify(productFC, never()).getProductStockAvailabity(anyInt()); // No stock check
	}

	// --- Test Cases for increaseProductQuantity ---

	@Test
	void testIncreaseProductQuantity_SuccessfullyUpdatesQuantity() {
		int userId = 1;
		int productId = 101;
		int quantityToAdd = 2;

		// Simulate user ID bypass by stubbing the response
		lenient().when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));

		// Setup cart and cart item
		CartItem cartItem = new CartItem();
		cartItem.setProductId(productId);
		cartItem.setProductPrice(150.0);
		cartItem.setQuantity(3); // Initial quantity

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(new ArrayList<>(List.of(cartItem)));

		ProductStockDTO stockDTO = new ProductStockDTO(productId, 10); // Available stock

		// Define mock behavior
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
		when(cartItemRepository.findByCartAndProductId(cart, productId)).thenReturn(Optional.of(cartItem));
		when(productFC.getProductStockAvailabity(productId)).thenReturn(stockDTO);
		when(cartRepository.save(cart)).thenReturn(cart);
		when(modelMapper.map(cart, CartDTO.class)).thenReturn(new CartDTO());

		// Invoke method
		CartDTO result = cartService.increaseProductQuantity(userId, productId, quantityToAdd);

		// Verify
		assertNotNull(result);
		assertEquals(5, cartItem.getQuantity()); // 3 existing + 2 added
		verify(cartItemRepository).save(cartItem);
		verify(cartRepository).save(cart);
	}

	@Test
	void testIncreaseQuantity_ProductNotFoundInCart() {
		final int userId = 42;
		final int productId = 101;
		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(new ArrayList<>());

		when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
		when(cartItemRepository.findByCartAndProductId(cart, productId)).thenReturn(Optional.empty());

		assertThrows(ProductNotFoundException.class, () -> cartService.increaseProductQuantity(userId, productId, 1));
	}

	@Test
	void increaseProductQuantity_UserNotFound_ThrowsUserNotFoundException() {
		int userId = 1;
		int productId = 101;
		int quantityToAdd = 1;

		when(userFC.getUserId(userId)).thenReturn(new ResponseEntity<>(HttpStatus.NOT_FOUND));

		assertThrows(UserNotFoundException.class,
				() -> cartService.increaseProductQuantity(userId, productId, quantityToAdd));

		verify(cartRepository, never()).findByUserId(anyInt()); // No cart ops
	}

	@Test
	void increaseProductQuantity_CartNotFound_ThrowsCartNotFoundException() {
		int userId = 1;
		int productId = 101;
		int quantityToAdd = 1;

		mockValidUser(userId);
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

		assertThrows(CartNotFoundException.class,
				() -> cartService.increaseProductQuantity(userId, productId, quantityToAdd));

		verify(cartItemRepository, never()).findByCartAndProductId(any(), anyInt()); // No item ops
	}

	@Test
	void testDecreaseQuantity_WithoutRemovingProduct() {
		int userId = 2;
		int productId = 101;
		int quantityToRemove = 1;

		// Stub user validation (though we're not really testing it here)
		lenient().when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));

		CartItem item = new CartItem();
		item.setProductId(productId);
		item.setProductPrice(100.0);
		item.setQuantity(3); // > quantityToRemove

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(new ArrayList<>(List.of(item)));

		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
		when(cartItemRepository.findByCartAndProductId(cart, productId)).thenReturn(Optional.of(item));
		when(cartRepository.save(cart)).thenReturn(cart);
		when(modelMapper.map(cart, CartDTO.class)).thenReturn(new CartDTO());

		CartDTO result = cartService.decreaseProductQuantity(userId, productId, quantityToRemove);

		assertNotNull(result);
		assertEquals(2, item.getQuantity());
		verify(cartItemRepository, never()).delete(item);
	}

	@Test
	void testDecreaseQuantity_Remove_Product() {
		int userId = 42;
		int productId = 101;
		int quantityToRemove = 5;

		lenient().when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));

		CartItem item = new CartItem();
		item.setProductId(productId);
		item.setProductPrice(50.0);
		item.setQuantity(5); // == quantityToRemove

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(new ArrayList<>(List.of(item)));

		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
		when(cartItemRepository.findByCartAndProductId(cart, productId)).thenReturn(Optional.of(item));
		when(cartRepository.save(cart)).thenReturn(cart);
		when(modelMapper.map(cart, CartDTO.class)).thenReturn(new CartDTO());

		CartDTO result = cartService.decreaseProductQuantity(userId, productId, quantityToRemove);

		assertNotNull(result);
		assertFalse(cart.getCartItems().contains(item));
		verify(cartItemRepository).delete(item);
	}

	@Test
	void decreaseProductQuantity_CartNotFound_ThrowsCartNotFoundException() {
		int userId = 1;
		int productId = 101;
		int quantityToRemove = 1;

		mockValidUser(userId);
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

		assertThrows(CartNotFoundException.class,
				() -> cartService.decreaseProductQuantity(userId, productId, quantityToRemove));
		verify(cartItemRepository, never()).findByCartAndProductId(any(), anyInt());
	}

	@Test
	void testClearCart_SuccessfullyClearsItemsAndResetsTotal() {
		int userId = 42;
		// Create a cart with some items and a total
		CartItem item1 = new CartItem();
		item1.setProductId(101);
		item1.setProductPrice(100.0);
		item1.setQuantity(2);

		CartItem item2 = new CartItem();
		item2.setProductId(102);
		item2.setProductPrice(50.0);
		item2.setQuantity(1);

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setTotalPrice(250.0);
		cart.setCartItems(new ArrayList<>(List.of(item1, item2)));

		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

		// Call method under test
		cartService.clearCart(userId);

		// Validate behavior
		assertEquals(0, cart.getCartItems().size());
		assertEquals(0.0, cart.getTotalPrice());
		verify(cartRepository).save(cart);
	}

	@Test
	void clearCart_ThrowsCartNotFoundException() {
		int userId = 1;
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

		assertThrows(CartNotFoundException.class, () -> cartService.clearCart(userId));
		verify(cartRepository, never()).save(any(Cart.class));
	}

	@Test
	void testRemoveProductFromCart_Success() {
		int userId = 42;
		int productId = 101;

		CartItem item = new CartItem();
		item.setProductId(productId);

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(new ArrayList<>(List.of(item)));

		// Mock user validation and cart retrieval
		when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

		cartService.removeProductFromCart(userId, productId);

		assertTrue(cart.getCartItems().isEmpty());
		verify(cartRepository).save(cart);
	}

	@Test
	void testRemoveProductFromCart_ProductNotFoundInCart() {
		int userId = 42;
		int productId = 101;

		CartItem otherItem = new CartItem();
		otherItem.setProductId(999);

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(new ArrayList<>(List.of(otherItem)));

		when(userFC.getUserId(userId)).thenReturn(ResponseEntity.ok(userId));
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

		ProductNotFoundException ex = assertThrows(ProductNotFoundException.class,
				() -> cartService.removeProductFromCart(userId, productId));

		assertEquals("Product with ID 101 not found in the cart", ex.getMessage());
	}

	// --- Test Cases for calculateTotalPrice ---

	@Test
	void testCalculateTotalPrice_ReturnsCorrectSum() {
		int userId = 42;
		CartItem item1 = new CartItem();
		item1.setProductPrice(200.0);
		item1.setQuantity(2); // 400.0

		CartItem item2 = new CartItem();
		item2.setProductPrice(150.0);
		item2.setQuantity(1); // 150.0

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(new ArrayList<>(List.of(item1, item2)));

		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

		double result = cartService.calculateTotalPrice(userId);

		assertEquals(550.0, result);
	}

	@Test
	void calculateTotalPrice_CartNotFound_ThrowsCartNotFoundException() {
		int userId = 1;
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

		assertThrows(CartNotFoundException.class, () -> cartService.calculateTotalPrice(userId));
	}

	// --- Test Cases for createCartForUser ---

	@Test
	void createCartForUser_CartAlreadyExists_ThrowsRuntimeException() {
		int userId = 1;
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(new Cart()));

		RuntimeException thrown = assertThrows(RuntimeException.class, () -> cartService.createCartForUser(userId));

		assertEquals("Cart already exists for user: " + userId, thrown.getMessage());
		verify(cartRepository, never()).save(any(Cart.class));
	}

	@Test
	void getTotalPriceForCart_CartNotFound_ThrowsCartNotFoundException() {
		int userId = 1;
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

		assertThrows(CartNotFoundException.class, () -> cartService.getTotalPriceForCart(userId));
	}

	// --- Test Cases for getCartItems ---

	@Test
	void getCartItems_CartNotFound_ThrowsCartNotFoundException() {
		int userId = 1;
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

		assertThrows(CartNotFoundException.class, () -> cartService.getCartItems(userId));
	}

	@Test
	void testGetCartBreakdownForUser_Success() {
		int userId = 1;
		// Mock cart items
		CartItem item1 = new CartItem();
		item1.setProductName("Book");
		item1.setProductPrice(100.0);
		item1.setQuantity(2);
		CartItem item2 = new CartItem();
		item2.setProductName("Pen");
		item2.setProductPrice(20.0);
		item2.setQuantity(3);
		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(List.of(item1, item2));
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
		CartSummaryResponse result = cartService.getCartBreakdownForUser(userId);
		assertNotNull(result);
		assertEquals(2, result.getItems().size());
		assertEquals(260.0, result.getTotalPrice()); // 2x100 + 3x20
		CartItemResponse firstItem = result.getItems().get(0);
		assertEquals("Book", firstItem.getProductname());
		assertEquals(100.0, firstItem.getProductprice());
		assertEquals(2, firstItem.getQuantity());
		assertEquals(200.0, firstItem.getSubtotal());
	}

	@Test
	void testGetCartBreakdownForUser_CartNotFound() {
		int userId = 99;
		when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());
		CartNotFoundException exception = assertThrows(CartNotFoundException.class, () -> {
			cartService.getCartBreakdownForUser(userId);
		});
		assertEquals("Cart not found for user: 99", exception.getMessage());
	}

	@Test
	void test_Get_Products_Present_to_add() {
		int userId = 42;

		// Create cart items
		CartItem item1 = new CartItem();
		item1.setProductId(101);
		item1.setProductPrice(250.0);
		item1.setQuantity(2);

		CartItem item2 = new CartItem();
		item2.setProductId(102);
		item2.setProductPrice(100.0);
		item2.setQuantity(1);

		Cart cart = new Cart();
		cart.setUserId(userId);
		cart.setCartItems(List.of(item1, item2));

		CartItemDTO dto1 = new CartItemDTO(101, 2);
		CartItemDTO dto2 = new CartItemDTO(102, 1);

		when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
		when(modelMapper.map(item1, CartItemDTO.class)).thenReturn(dto1);
		when(modelMapper.map(item2, CartItemDTO.class)).thenReturn(dto2);

		List<CartItemDTO> result = cartService.getCartItems(userId);

		assertNotNull(result);
		assertEquals(2, result.size());
		assertEquals(101, result.get(0).getProductId());
		assertEquals(2, result.get(0).getQuantity());
	}

}