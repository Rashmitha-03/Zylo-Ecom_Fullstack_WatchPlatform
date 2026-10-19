package com.cts.service;

import com.cts.config.CartFC;
import com.cts.config.PaymentFC;
import com.cts.config.ProductFC;
import com.cts.config.UserFC;
import com.cts.dto.AddressResponse;
import com.cts.dto.CartClientDTO;
import com.cts.dto.CartClientOnlineDTO;
import com.cts.dto.CartItemDTO;
import com.cts.dto.OfflineDTO;
import com.cts.dto.OrderDTO;
import com.cts.dto.PaymentRequestDto;
import com.cts.dto.PaymentResponseDto;
import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductGenderDto;
import com.cts.dto.ProductResponse;
import com.cts.dto.ProductStats;
import com.cts.dto.ProductStockDTO;
import com.cts.dto.ProductSummary;
import com.cts.entity.CartItem;
import com.cts.entity.CartOrder;
import com.cts.entity.Order;
import com.cts.exception.AddressNotFoundException;
import com.cts.exception.CartEmptyException;
import com.cts.exception.InsufficientStockException;
import com.cts.exception.InvalidOrderStatusException;
import com.cts.exception.OrderNotFoundException;
import com.cts.exception.OrderReplacementException;
import com.cts.exception.OrderReturnException;
import com.cts.exception.PaymentInitiationException;
import com.cts.exception.ProductNotFoundException;
import com.cts.exception.RefundProcessingException;
import com.cts.exception.UserNotFoundException;
import com.cts.repository.CartItemRepository;
import com.cts.repository.CartOrderRepository;
import com.cts.repository.OrderRepository;
import com.cts.store.TempOrderStore;
import com.cts.store.TempOrderStoreTwo;

import feign.FeignException;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

	private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private CartOrderRepository cartOrderRepository;
	
	@Autowired
	private CartItemRepository cartItemRepository;

	@Autowired
	private UserFC userFC;

	@Autowired
	private ProductFC productFC;

	@Autowired
	private PaymentFC paymentFC;

	@Autowired
	private TempOrderStore tempOrderStore;
	
	@Autowired
	private TempOrderStoreTwo tempOrderStoreTwo;

	@Autowired
	private CartFC cartFC;

	@Autowired
	private ModelMapper modelMapper;

	public String generateUniqueOrderId() {
		String orderId = String.format("%010d", new Random().nextInt(1_000_000_000));
		logger.info("Generated unique order ID: {}", orderId);
		return orderId;
	}

	@Override
	public OfflineDTO placeOrderCashOnDelivery(OfflineDTO offlineDTO) {
	    logger.info("Placing order with Cash on Delivery for user ID: {}", offlineDTO.getUserId());

	    // Step 1: Validate user
	    int userId;
	    try {
	        ResponseEntity<Integer> response = userFC.getUserId(offlineDTO.getUserId());
	        userId = response.getBody();
	        if (userId == 0) {
	            logger.error("User ID response body was null");
	            throw new UserNotFoundException("User does not exist.");
	        }
	    } catch (FeignException fe) {
	        logger.error("User validation failed: {}", fe.getMessage());
	        throw new UserNotFoundException("User validation failed.");
	    }

	    // Step 2: Validate address ownership
	    List<AddressResponse> addresses = userFC.getUserAddresses(userId).getBody();
	    if (addresses == null || addresses.isEmpty()) {
	        throw new AddressNotFoundException("No addresses found for user.");
	    }
	    boolean isValidAddress = addresses.stream()
	            .anyMatch(addr -> Objects.equals(addr.getId(), offlineDTO.getAddressId()));
	    if (!isValidAddress) {
	        throw new AddressNotFoundException("Provided address does not belong to user.");
	    }

	    // Step 3: Validate product
	    ProductCartDTO matchedProduct = productFC.getProductSummaries().stream()
	            .filter(p -> p.getProductID() == offlineDTO.getProductId()).findFirst()
	            .orElseThrow(() -> new ProductNotFoundException("Invalid product ID."));

	    // Step 4: Check stock
	    ProductStockDTO stockDTO = productFC.getProductStockAvailabity(offlineDTO.getProductId());
	    if (stockDTO.getAvailableStock() < offlineDTO.getQuantity()) {
	        throw new InsufficientStockException("Insufficient stock available.");
	    }

	    // Step 5: Enrich and map order details
	    offlineDTO.setProductName(matchedProduct.getName());
	    offlineDTO.setOrderAmount(matchedProduct.getPrice());

	    Order order = modelMapper.map(offlineDTO, Order.class);
	    order.setOrderId(generateUniqueOrderId());
	    order.setPaymentMethod("Cash on Delivery");
	    order.setOrderStatus("Placed");
	    order.setPaymentStatus("PENDING"); // ✅ Set default payment status
	    order.setPaymentId(0L); // ✅ Store placeholder payment ID for tracking
	    order.setTotalPrice(order.getQuantity() * order.getOrderAmount());
	    order.setUserId(userId);
	    order.setAddressId(offlineDTO.getAddressId());

	    // Step 6: Save the order
	    Order savedOrder = orderRepository.save(order);

	    // Step 7: Reduce stock after successful order placement
	    productFC.reduceStock(order.getProductId(), order.getQuantity());

	    logger.info("Order placed successfully for user ID: {}", offlineDTO.getUserId());
	    return modelMapper.map(savedOrder, OfflineDTO.class);
	}


	@Override
	public OrderDTO startOnlinePayment(OrderDTO orderDTO) {
	    logger.info("Starting payment initiation flow for user ID: {}", orderDTO.getUserId());

	    // Step 1: Validate user
	    int userId;
	    try {
	        ResponseEntity<Integer> response = userFC.getUserId(orderDTO.getUserId());
	        userId = response.getBody();
	        if (userId == 0) {
	            throw new UserNotFoundException("User does not exist.");
	        }
	    } catch (FeignException fe) {
	        throw new UserNotFoundException("User validation failed.");
	    }

	    // Step 2: Validate address ownership
	    List<AddressResponse> addresses = userFC.getUserAddresses(userId).getBody();
	    if (addresses == null || addresses.isEmpty()) {
	        throw new AddressNotFoundException("No addresses found for user.");
	    }
	    boolean isValidAddress = addresses.stream()
	            .anyMatch(addr -> Objects.equals(addr.getId(), orderDTO.getAddressId()));
	    if (!isValidAddress) {
	        throw new AddressNotFoundException("Provided address does not belong to user.");
	    }

	    // Step 3: Validate product
	    ProductCartDTO matchedProduct = productFC.getProductSummaries().stream()
	            .filter(p -> p.getProductID() == orderDTO.getProductId()).findFirst()
	            .orElseThrow(() -> new ProductNotFoundException("Invalid product ID."));

	    // Step 4: Check stock availability
	    ProductStockDTO stockDTO = productFC.getProductStockAvailabity(orderDTO.getProductId());
	    if (stockDTO.getAvailableStock() < orderDTO.getQuantity()) {
	        throw new InsufficientStockException("Insufficient stock available.");
	    }

	    // Step 5: Initiate payment
	    PaymentRequestDto paymentRequest = new PaymentRequestDto();
	    paymentRequest.setAmount(matchedProduct.getPrice() * orderDTO.getQuantity());
	    paymentRequest.setUpiId(orderDTO.getUpiId());

	    PaymentResponseDto paymentResponse;
	    try {
	        paymentResponse = paymentFC.initiatePayment(paymentRequest);
	    } catch (FeignException fe) {
	        throw new PaymentInitiationException("Payment initiation failed.");
	    }

	    Long paymentId = paymentResponse.getPaymentId();

	    // Step 6: Populate fields for response
	    orderDTO.setPaymentId(paymentId);
	    orderDTO.setProductName(matchedProduct.getName());
	    orderDTO.setOrderAmount(matchedProduct.getPrice());

	    // Step 7: Save order data for later finalization
	    tempOrderStore.save(paymentId, orderDTO);

	    logger.info("Payment initiated successfully. Payment ID: {}", paymentId);
	    return orderDTO;
	}


	@Override
	public OrderDTO finalizeOnlineOrder(Long paymentId) {
	    logger.info("Finalizing order for payment ID: {}", paymentId);

	    // Step 1: Retrieve saved order data
	    OrderDTO orderDTO = tempOrderStore.get(paymentId);
	    if (orderDTO == null) {
	        throw new OrderNotFoundException("No order data found for payment ID: " + paymentId);
	    }

	    // Step 2: Validate product availability
	    ProductCartDTO product = productFC.getProductSummaries().stream()
	            .filter(p -> p.getProductID() == orderDTO.getProductId()).findFirst()
	            .orElseThrow(() -> new ProductNotFoundException("Product not found."));

	    // Step 3: Map data into a new order entity
	    Order order = new Order();
	    order.setOrderId(generateUniqueOrderId());
	    order.setUserId(orderDTO.getUserId());
	    order.setProductId(orderDTO.getProductId());
	    order.setAddressId(orderDTO.getAddressId());
	    order.setProductName(product.getName());
	    order.setOrderAmount(product.getPrice());
	    order.setQuantity(orderDTO.getQuantity());
	    order.setTotalPrice(product.getPrice() * orderDTO.getQuantity());
	    order.setPaymentMethod("Online Payment");
	    order.setPaymentId(paymentId); // ✅ Explicitly storing payment ID
	    order.setPaymentStatus("SUCCESS"); // ✅ Explicitly storing payment status
	    order.setOrderStatus("Placed");


	    try {
	        orderRepository.save(order);
	        productFC.reduceStock(orderDTO.getProductId(), orderDTO.getQuantity());
	    } catch (Exception e) {
	        throw new RefundProcessingException("Failed to finalize the order due to a transaction error.");
	    }

	    // Step 4: Clean up the temporary cache entry
	    tempOrderStore.remove(paymentId);

	    logger.info("Order successfully placed for payment ID: {}", paymentId);

	    // Step 5: Build and return enriched OrderDTO
	    OrderDTO finalized = new OrderDTO();
	    finalized.setOrderId(order.getOrderId());
	    finalized.setUserId(order.getUserId());
	    finalized.setProductId(order.getProductId());
	    finalized.setProductName(order.getProductName());
	    finalized.setOrderAmount(order.getOrderAmount());
	    finalized.setQuantity(order.getQuantity());
	    finalized.setTotalPrice(order.getTotalPrice());
	    finalized.setPaymentId(paymentId);
	    finalized.setPaymentStatus("SUCCESS"); // ✅ Ensure this is set in the response too
	    finalized.setOrderStatus(order.getOrderStatus());

	    finalized.setAddressId(order.getAddressId());
	    finalized.setUpiId(orderDTO.getUpiId());

	    return finalized;
	}

	@Override
	public OrderDTO cancelOrder(String orderId) {
	    logger.info("Attempting to cancel order with ID: {}", orderId);

	    // 🔹 Try direct order first
	    Order order = orderRepository.findByOrderId(orderId);
	    if (order != null) {
	        if ("Delivered".equalsIgnoreCase(order.getOrderStatus())) {
	            throw new InvalidOrderStatusException("Order cannot be cancelled as it is already " + order.getOrderStatus());
	        }

	        order.setOrderStatus("Cancelled");

	        // ✅ Set payment status dynamically based on payment method
	        if ("Cash on Delivery".equalsIgnoreCase(order.getPaymentMethod())) {
	            order.setPaymentStatus("Cancelled");
	        } else {
	            order.setPaymentStatus("Refunded");
	        }

	        orderRepository.save(order);

	        // 🔄 Restore stock
	        productFC.updateStock(order.getProductId(), order.getQuantity());

	        logger.info("Direct order cancelled successfully: {}", orderId);

	        OrderDTO dto = modelMapper.map(order, OrderDTO.class);
	        return dto;
	    }

	    // 🔹 Try cart order
	    CartOrder cartOrder = cartOrderRepository.findByOrderId(orderId);
	    if (cartOrder == null) {
	        logger.error("Order not found: {}", orderId);
	        throw new OrderNotFoundException("Order not found: " + orderId);
	    }

	    if ("Delivered".equalsIgnoreCase(cartOrder.getOrderStatus())) {
	        throw new InvalidOrderStatusException("Order cannot be cancelled as it is already " + cartOrder.getOrderStatus());
	    }

	    cartOrder.setOrderStatus("Cancelled");

	    // ✅ Set payment status dynamically based on payment method
	    if ("Cash on Delivery".equalsIgnoreCase(cartOrder.getPaymentMethod())) {
	        cartOrder.setPaymentStatus("Cancelled");
	    } else {
	        cartOrder.setPaymentStatus("Refunded");
	    }

	    cartOrderRepository.save(cartOrder);

	    List<CartItem> cartItems = cartItemRepository.findByOrderId(cartOrder.getOrderId());

	    for (CartItem item : cartItems) {
	        item.setStatus("Cancelled");
	        productFC.updateStock(item.getProductId(), item.getQuantity());
	        cartItemRepository.save(item);
	    }

	    logger.info("Cart order cancelled successfully: {}", orderId);

	    // 🧾 Build response
	    OrderDTO dto = new OrderDTO();
	    dto.setOrderId(cartOrder.getOrderId());
	    dto.setUserId(cartOrder.getUserId());
	    dto.setAddressId(cartOrder.getAddressId());
	    dto.setOrderAmount(cartOrder.getTotalPrice());
	    dto.setQuantity(cartItems.stream().mapToInt(CartItem::getQuantity).sum());
	    dto.setProductName("Cart items");
	    dto.setPaymentStatus(cartOrder.getPaymentStatus());
	    dto.setUpiId(null);

	    return dto;
	}

	@Override
	public OrderDTO returnOrder(String orderId, int productId, int quantity, String upiId) {
	    logger.info("Initiating return process for order ID: {}", orderId);

	    // 🔹 Direct Order Flow
	    Order order = orderRepository.findByOrderId(orderId);
	    if (order != null) {
	        validateReturnEligibility(order, productId, quantity, upiId);

	        if ("Cash on Delivery".equalsIgnoreCase(order.getPaymentMethod())) {
	            order.setPaymentId(generateRefundTransactionId());
	            order.setPaymentStatus("Refunded to UPI: " + upiId);
	        }

	        order.setOrderStatus("Returned");
	        order.setRefundStatus("Refunded");

	        productFC.updateStock(productId, quantity);
	        Order returnedOrder = orderRepository.save(order);
	        logger.info("Direct order returned: {}", orderId);

	        return modelMapper.map(returnedOrder, OrderDTO.class);
	    }

	    // 🔹 Cart Order Flow
	    CartOrder cartOrder = cartOrderRepository.findByOrderId(orderId);
	    if (cartOrder == null) {
	        throw new OrderNotFoundException("Order not found: " + orderId);
	    }

	    validateReturnEligibilityForCart(cartOrder, productId, quantity, upiId);

	    List<CartItem> cartItems = cartItemRepository.findByOrderId(cartOrder.getOrderId());

	    CartItem item = cartItems.stream()
	        .filter(ci -> ci.getProductId() == productId && !"Returned".equalsIgnoreCase(ci.getStatus()))
	        .findFirst()
	        .orElseThrow(() -> new ProductNotFoundException("Product not found or already returned."));


	    adjustCartItemQuantity(cartOrder, item, quantity);

	    if ("Cash on Delivery".equalsIgnoreCase(cartOrder.getPaymentMethod())) {
	        cartOrder.setPaymentStatus("Refunded to UPI: " + upiId);
	    }

	    cartOrder.setRefundStatus("Refunded");

	    

	    boolean allReturned = cartItems.stream()
	        .allMatch(ci -> "Returned".equalsIgnoreCase(ci.getStatus()));


	    if (allReturned) {
	        cartOrder.setOrderStatus("Returned");
	    }

	    cartOrderRepository.save(cartOrder);
	    productFC.updateStock(productId, quantity);
	    logger.info("Cart order returned: {}", orderId);

	    return buildOrderDTO(cartOrder, orderId, productId, quantity, upiId);
	}

	private void adjustCartItemQuantity(CartOrder cartOrder, CartItem item, int quantity) {
	    if (quantity == item.getQuantity()) {
	        item.setStatus("Returned");
	        cartItemRepository.save(item); // ✅ persist updated item
	    } else {
	        item.setQuantity(item.getQuantity() - quantity);
	        cartItemRepository.save(item); // ✅ persist updated quantity

	        CartItem returnedItem = new CartItem();
	        returnedItem.setProductId(item.getProductId());
	        returnedItem.setQuantity(quantity);
	        returnedItem.setStatus("Returned");
	        returnedItem.setOrderId(cartOrder.getOrderId());

	        cartItemRepository.save(returnedItem); // ✅ persist new returned item
	    }
	}


	private void validateReturnEligibility(Order order, int productId, int quantity, String upiId) {
	    if (!"Delivered".equalsIgnoreCase(order.getOrderStatus())) {
	        throw new InvalidOrderStatusException("Order can only be returned after it is delivered.");
	    }
	    if (order.getOrderTime().plusDays(10).isBefore(LocalDateTime.now())) {
	        throw new OrderReturnException("Return period expired.");
	    }
	    if (order.getProductId() != productId) {
	        throw new ProductNotFoundException("Product ID mismatch.");
	    }
	    if (quantity > order.getQuantity()) {
	        throw new InsufficientStockException("Quantity exceeds ordered amount.");
	    }
	    if ("Cash on Delivery".equalsIgnoreCase(order.getPaymentMethod())
	        && (upiId == null || upiId.isBlank())) {
	        throw new PaymentInitiationException("UPI ID is required for COD refunds.");
	    }
	}

	private void validateReturnEligibilityForCart(CartOrder cartOrder, int productId, int quantity, String upiId) {
	    if (!"Delivered".equalsIgnoreCase(cartOrder.getOrderStatus())) {
	        throw new InvalidOrderStatusException("Cart order can only be returned after it is delivered.");
	    }

	    if (cartOrder.getOrderTime().plusDays(10).isBefore(LocalDateTime.now())) {
	        throw new OrderReturnException("Return period expired.");
	    }

	    // 🔍 Fetch items from the repository instead of cartOrder.getItems()
	    List<CartItem> cartItems = cartItemRepository.findByOrderId(cartOrder.getOrderId());

	    CartItem item = cartItems.stream()
	        .filter(ci -> ci.getProductId() == productId && !"Returned".equalsIgnoreCase(ci.getStatus()))
	        .findFirst()
	        .orElseThrow(() -> new ProductNotFoundException("Product not found in cart order or already returned."));

	    if (quantity > item.getQuantity()) {
	        throw new InsufficientStockException("Cannot return more than ordered quantity.");
	    }

	    if ("Cash on Delivery".equalsIgnoreCase(cartOrder.getPaymentMethod())
	        && (upiId == null || upiId.isBlank())) {
	        throw new PaymentInitiationException("UPI ID required for COD refunds.");
	    }
	}


	public Long generateRefundTransactionId() {
	    return Long.parseLong(String.format("REF%010d", new Random().nextInt(1_000_000_000)).replaceAll("[^0-9]", ""));
	}

	private OrderDTO buildOrderDTO(CartOrder cartOrder, String orderId, int productId, int quantity, String upiId) {
	    OrderDTO dto = new OrderDTO();
	    dto.setOrderId(orderId);
	    dto.setUserId(cartOrder.getUserId());
	    dto.setProductId(productId);
	    dto.setQuantity(quantity);
	    dto.setPaymentStatus(cartOrder.getPaymentStatus());
	    dto.setOrderAmount(cartOrder.getTotalPrice());
	    dto.setAddressId(cartOrder.getAddressId());
	    dto.setUpiId(upiId);
	    dto.setProductName("Cart product");
	    return dto;
	}


	@Override
	public OrderDTO searchOrderById(String orderId) {
	    logger.info("Searching for order with ID: {}", orderId);

	    // 🔹 Try direct order first
	    Order order = orderRepository.findByOrderId(orderId);
	    if (order != null) {
	        logger.info("Direct order found with ID: {}", orderId);

	        OrderDTO dto = modelMapper.map(order, OrderDTO.class);
	        dto.setOrderAmount(order.getTotalPrice()); // ✅ make sure amount is set

	        // ⛑ Wrap direct order into product summary
	        ProductSummary summary = new ProductSummary();
	        summary.setProductId(order.getProductId());
	        summary.setProductName(order.getProductName());
	        summary.setQuantity(order.getQuantity());
	        summary.setStatus(order.getOrderStatus());

	        dto.setProducts(List.of(summary));

	        logger.info("Final OrderDTO (direct) → orderAmount: ₹{}", dto.getOrderAmount());
	        return dto;
	    }

	    // 🔹 Fallback to cart order
	    CartOrder cartOrder = cartOrderRepository.findByOrderId(orderId);
	    if (cartOrder == null) {
	        logger.error("Order not found in both direct and cart orders: {}", orderId);
	        throw new OrderNotFoundException("Order not found: " + orderId);
	    }

	    logger.info("Cart order found with ID: {}", orderId);
	    logger.info("Fetched totalPrice from cartOrder: ₹{}", cartOrder.getTotalPrice());

	    // 🔁 Fetch cart items
	    List<CartItem> cartItems = cartItemRepository.findByOrderId(orderId);

	    // 🧱 Build DTO
	    OrderDTO dto = new OrderDTO();
	    dto.setOrderId(cartOrder.getOrderId());
	    dto.setUserId(cartOrder.getUserId());
	    dto.setOrderAmount(cartOrder.getTotalPrice()); // ✅ set here for cart orders
	    dto.setPaymentStatus(cartOrder.getPaymentStatus());
	    dto.setAddressId(cartOrder.getAddressId());
	    dto.setQuantity(cartItems.stream().mapToInt(CartItem::getQuantity).sum());
	    dto.setProductName("Cart items");

	    // 🧩 Build products[]
	    List<ProductSummary> summaries = cartItems.stream().map(item -> {
	        ProductSummary summary = new ProductSummary();
	        summary.setProductId(item.getProductId());
	        summary.setQuantity(item.getQuantity());
	        summary.setStatus(item.getStatus());

	        try {
	            var product = productFC.getProductById(item.getProductId());
	            summary.setProductName(product.getName());
	        } catch (Exception e) {
	            summary.setProductName("Unknown Product");
	        }

	        return summary;
	    }).collect(Collectors.toList());

	    dto.setProducts(summaries);

	    logger.info("Final OrderDTO (cart) → orderAmount: ₹{}", dto.getOrderAmount());
	    return dto;
	}

	private static final List<String> VALID_STATUSES = List.of("Placed", "Shipped", "Delivered", "Cancelled",
			"Returned", "Replaced");

	@Override
	public List<OrderDTO> searchOrderByStatus(String orderStatus) {
	    logger.info("Searching orders by status: {}", orderStatus);

	    // Normalize status input
	    String normalizedStatus = orderStatus.trim().toLowerCase();

	    boolean isValid = VALID_STATUSES.stream().anyMatch(valid -> valid.equalsIgnoreCase(normalizedStatus));
	    if (!isValid) {
	        logger.error("Invalid order status provided: {}. Valid statuses are: {}", orderStatus, VALID_STATUSES);
	        throw new InvalidOrderStatusException("Invalid order status: " + orderStatus + ". Valid statuses are: "
	                + String.join(", ", VALID_STATUSES));
	    }

	    // 🔹 Fetch direct orders
	    List<Order> directOrders = orderRepository.findByOrderStatusIgnoreCase(orderStatus);
	    logger.info("Found {} direct orders with status: {}", directOrders.size(), orderStatus);

	    // 🔹 Fetch cart-based orders
	    List<CartOrder> cartOrders = cartOrderRepository.findByOrderStatusIgnoreCase(orderStatus);
	    logger.info("Found {} cart orders with status: {}", cartOrders.size(), orderStatus);

	    // 🔹 Convert direct orders
	    List<OrderDTO> orderDTOs = directOrders.stream()
	            .map(order -> modelMapper.map(order, OrderDTO.class))
	            .collect(Collectors.toList());

	    // 🔹 Convert cart orders manually
	    List<OrderDTO> cartOrderDTOs = cartOrders.stream()
	            .map(cartOrder -> {
	                OrderDTO dto = new OrderDTO();
	                dto.setOrderId(cartOrder.getOrderId());
	                dto.setUserId(cartOrder.getUserId());
	                dto.setOrderAmount(cartOrder.getTotalPrice());
	                dto.setPaymentStatus(cartOrder.getPaymentStatus());
	                dto.setAddressId(cartOrder.getAddressId());
	                List<CartItem> cartItems = cartItemRepository.findByOrderId(cartOrder.getOrderId());
	                dto.setQuantity(cartItems.stream().mapToInt(CartItem::getQuantity).sum());

	                dto.setProductName("Cart items"); // Placeholder
	                return dto;
	            })
	            .collect(Collectors.toList());

	    // 🔹 Combine both order lists
	    orderDTOs.addAll(cartOrderDTOs);

	    return orderDTOs;
	}


	@Override
	public List<OrderDTO> searchOrderByUserId(int userId) {
	    logger.info("Searching orders for user ID: {}", userId);

	    // 🔹 Fetch direct orders
	    List<Order> directOrders = orderRepository.findByUserId(userId);
	    logger.info("Found {} direct orders for user ID: {}", directOrders.size(), userId);

	    // 🔹 Fetch cart-based orders
	    List<CartOrder> cartOrders = cartOrderRepository.findByUserId(userId);
	    logger.info("Found {} cart orders for user ID: {}", cartOrders.size(), userId);

	    if ((directOrders == null || directOrders.isEmpty()) &&
	    	    (cartOrders == null || cartOrders.isEmpty())) {
	    	    logger.warn("⚠️ No orders found for user ID: {}", userId);
	    	    return Collections.emptyList(); // Gracefully return empty list
	    	}


	    // 🔹 Convert direct orders and attach single-product list
	    List<OrderDTO> orderDTOs = directOrders.stream()
	        .map(order -> {
	            OrderDTO dto = modelMapper.map(order, OrderDTO.class);
	            
	            dto.setTotalPrice(order.getTotalPrice());

	            // Wrap productId/productName into List<ProductSummary>
	            ProductSummary summary = new ProductSummary();
	            summary.setProductId(order.getProductId());
	            summary.setProductName(order.getProductName());
	            summary.setQuantity(order.getQuantity());
	            dto.setProducts(List.of(summary));  // ✅ Consistent field for frontend

	            return dto;
	        })
	        .collect(Collectors.toList());

	    // 🔹 Convert cart orders manually
	    List<OrderDTO> cartOrderDTOs = cartOrders.stream()
	    		.map(cartOrder -> {
	    		    OrderDTO dto = new OrderDTO();
	    		    dto.setOrderId(cartOrder.getOrderId());
	    		    dto.setUserId(cartOrder.getUserId());
	    		    dto.setTotalPrice(cartOrder.getTotalPrice());
	    		    dto.setPaymentStatus(cartOrder.getPaymentStatus());
	    		    dto.setPaymentId(cartOrder.getPaymentId());
	    		    dto.setPaymentMethod(cartOrder.getPaymentMethod());
	    		    dto.setOrderStatus(cartOrder.getOrderStatus());
	    		    dto.setOrderTime(cartOrder.getOrderTime());
	    		    dto.setAddressId(cartOrder.getAddressId());

	    		    List<CartItem> cartItems = cartItemRepository.findByOrderId(cartOrder.getOrderId());
	    		    dto.setQuantity(cartItems.stream().mapToInt(CartItem::getQuantity).sum());

	    		    List<ProductSummary> productSummaries = cartItems.stream()
	    		        .map(item -> {
	    		            ProductSummary summary = new ProductSummary();
	    		            summary.setProductId(item.getProductId());

	    		            try {
	    		                var product = productFC.getProductById(item.getProductId());
	    		                summary.setProductName(product.getName());
	    		            } catch (Exception e) {
	    		                summary.setProductName("Unknown Product");
	    		            }

	    		            summary.setStatus(item.getStatus());
	    		            summary.setQuantity(item.getQuantity());
	    		            return summary;
	    		        })
	    		        .collect(Collectors.toList());

	    		    dto.setProducts(productSummaries);
	    		    dto.setProductId(0);
	    		    dto.setProductName(null);

	    		    return dto;
	    		})

	        .collect(Collectors.toList());

	    // 🔹 Combine and return
	    orderDTOs.addAll(cartOrderDTOs);
	    return orderDTOs;
	}


	@Override
	public OrderDTO replaceOrder(String orderId, int productId, int quantity, String upiId) {
	    logger.info("Initiating replacement for order ID: {}", orderId);

	    // 🔹 Direct Order Flow
	    Order order = orderRepository.findByOrderId(orderId);
	    if (order != null) {
	        if (!"Delivered".equalsIgnoreCase(order.getOrderStatus())) {
	            throw new InvalidOrderStatusException("Order can only be replaced after it is delivered.");
	        }

	        if (order.getOrderTime().plusDays(10).isBefore(LocalDateTime.now())) {
	            throw new OrderReplacementException("Replacement period expired. Only within 10 days of delivery.");
	        }

	        if (order.getProductId() != productId) {
	            throw new ProductNotFoundException("Product ID mismatch for this direct order.");
	        }

	        if (quantity > order.getQuantity()) {
	            throw new InsufficientStockException("Cannot replace more than originally ordered quantity.");
	        }

	        order.setOrderStatus("Replaced");
	        order.setOrderTime(LocalDateTime.now());

	        Order replacedOrder = orderRepository.save(order);
	        logger.info("Direct order successfully replaced: {}", orderId);

	        return modelMapper.map(replacedOrder, OrderDTO.class);
	    }

	 // 🔹 Cart Order Flow
	    CartOrder cartOrder = cartOrderRepository.findByOrderId(orderId);
	    if (cartOrder == null) {
	        throw new OrderNotFoundException("Order not found: " + orderId);
	    }

	    if (!"Delivered".equalsIgnoreCase(cartOrder.getOrderStatus())) {
	        throw new InvalidOrderStatusException("Cart order can only be replaced after it is delivered.");
	    }

	    if (cartOrder.getOrderTime().plusDays(10).isBefore(LocalDateTime.now())) {
	        throw new OrderReplacementException("Replacement period expired. Only within 10 days of delivery.");
	    }

	    // 🔹 Fetch items manually
	    List<CartItem> cartItems = cartItemRepository.findByOrderId(orderId);

	    CartItem item = cartItems.stream()
	        .filter(ci -> ci.getProductId() == productId && !"Replaced".equalsIgnoreCase(ci.getStatus()))
	        .findFirst()
	        .orElseThrow(() -> new ProductNotFoundException("Product not found in cart order or already replaced."));

	    if (quantity > item.getQuantity()) {
	        throw new InsufficientStockException("Cannot replace more than originally ordered quantity.");
	    }

	    // 🌟 Replace logic
	    if (quantity == item.getQuantity()) {
	        item.setStatus("Replaced");
	        cartItemRepository.save(item); // ✅ Persist updated item
	    } else {
	        // 🌟 Partial replacement
	        item.setQuantity(item.getQuantity() - quantity);
	        cartItemRepository.save(item); // ✅ Persist updated quantity

	        CartItem replacedItem = new CartItem();
	        replacedItem.setProductId(productId);
	        replacedItem.setQuantity(quantity);
	        replacedItem.setStatus("Replaced");
	        replacedItem.setOrderId(cartOrder.getOrderId());

	        cartItemRepository.save(replacedItem); // ✅ Persist new replaced item
	    }

	    // ⏱️ Optional: update status and timestamp
	    cartOrder.setRefundStatus("Replaced");
	    cartOrder.setOrderTime(LocalDateTime.now());
	    cartOrderRepository.save(cartOrder);

	    logger.info("Cart order successfully replaced: {}", orderId);

	    // 🔹 Build response DTO
	    OrderDTO dto = new OrderDTO();
	    dto.setOrderId(orderId);
	    dto.setUserId(cartOrder.getUserId());
	    dto.setAddressId(cartOrder.getAddressId());
	    dto.setOrderAmount(cartOrder.getTotalPrice());
	    dto.setPaymentStatus(cartOrder.getPaymentStatus());
	    dto.setQuantity(quantity);
	    dto.setProductName("Cart item replaced");
	    dto.setUpiId(upiId);

	    return dto;
	}
	
	@Override
	public OrderDTO markOrderAsDelivered(String orderId) {
	    logger.info("Marking order as delivered for ID: {}", orderId);

	    // 🔹 Try direct order first
	    Order order = orderRepository.findByOrderId(orderId);
	    if (order != null) {
	        if (!"Placed".equalsIgnoreCase(order.getOrderStatus()) && !"Shipped".equalsIgnoreCase(order.getOrderStatus())) {
	            throw new InvalidOrderStatusException("Order cannot be marked as delivered unless it is Placed or Shipped.");
	        }

	        order.setOrderStatus("Delivered");

	        if ("Cash on Delivery".equalsIgnoreCase(order.getPaymentMethod())) {
	            order.setPaymentStatus("SUCCESS");
	        }

	        Order deliveredOrder = orderRepository.save(order);
	        logger.info("Direct order marked as delivered: {}", orderId);

	        return modelMapper.map(deliveredOrder, OrderDTO.class);
	    }

	    // 🔹 Fallback to cart-based order
	    CartOrder cartOrder = cartOrderRepository.findByOrderId(orderId);
	    if (cartOrder == null) {
	        logger.error("Order not found in direct or cart orders: {}", orderId);
	        throw new OrderNotFoundException("Order not found: " + orderId);
	    }

	    if (!"Placed".equalsIgnoreCase(cartOrder.getOrderStatus()) && !"Shipped".equalsIgnoreCase(cartOrder.getOrderStatus())) {
	        throw new InvalidOrderStatusException("Cart order cannot be marked as delivered unless it is Placed or Shipped.");
	    }

	    cartOrder.setOrderStatus("Delivered");

	    if ("Cash on Delivery".equalsIgnoreCase(cartOrder.getPaymentMethod())) {
	        cartOrder.setPaymentStatus("SUCCESS");
	    }

	    // 🔹 Set all items as delivered
	    List<CartItem> cartItems = cartItemRepository.findByOrderId(orderId);

	    for (CartItem item : cartItems) {
	        item.setStatus("Delivered");
	        cartItemRepository.save(item);
	    }


	


	    cartOrderRepository.save(cartOrder);
	    logger.info("Cart order marked as delivered: {}", orderId);

	    // 🔹 Build DTO manually
	    OrderDTO dto = new OrderDTO();
	    dto.setOrderId(cartOrder.getOrderId());
	    dto.setUserId(cartOrder.getUserId());
	    dto.setOrderAmount(cartOrder.getTotalPrice());
	    dto.setOrderStatus(cartOrder.getOrderStatus());
	    dto.setPaymentStatus(cartOrder.getPaymentStatus());
	    dto.setPaymentId(cartOrder.getPaymentId());
	    dto.setAddressId(cartOrder.getAddressId());
	    dto.setQuantity(cartItems.stream().mapToInt(CartItem::getQuantity).sum());
	    dto.setProductName("Cart items"); // Placeholder
	   // dto.setPaymentId(null); // Optional field

	    return dto;
	}

	@Override
	public CartClientDTO placeOrderFromCartCashOnDelivery(int userId, int addressId) {
	    logger.info("Placing cart order with Cash on Delivery for user ID: {}", userId);

	    // 🔹 Step 1: Validate user ID
	    ResponseEntity<Integer> userResponse = userFC.getUserId(userId);
	    if (userResponse.getBody() == null || userResponse.getStatusCode() != HttpStatus.OK) {
	        throw new UserNotFoundException("Order cannot be placed because the user ID is invalid or does not exist.");
	    }

	    // 🔹 Step 2: Validate address ownership
	    ResponseEntity<List<AddressResponse>> response = userFC.getUserAddresses(userId);
	    List<AddressResponse> addresses = response.getBody();
	    boolean addressExists = addresses != null && addresses.stream().anyMatch(addr -> addr.getId() == addressId);

	    if (!addressExists) {
	        throw new AddressNotFoundException("Order cannot be placed because the provided address ID is invalid.");
	    }

	    // 🔹 Step 3: Get cart items
	    List<CartItemDTO> cartDTOs = cartFC.getCartItems(userId);
	    if (cartDTOs == null || cartDTOs.isEmpty()) {
	        throw new CartEmptyException("Order cannot be placed because your cart is empty.");
	    }

	    // 🔹 Step 4: Convert DTOs to entities
	    List<CartItem> cartItems = cartDTOs.stream().map(dto -> {
	        CartItem item = new CartItem();
	        item.setId(dto.getId()); // Preserve original cart item ID
	        item.setProductId(dto.getProductId());
	        item.setQuantity(dto.getQuantity());
	        return item;
	    }).collect(Collectors.toList());

	 // 🔹 Step 5: Create and populate order entity
	    CartOrder order = new CartOrder();
	    String generatedOrderId = generateUniqueOrderId();

	    order.setOrderId(generatedOrderId);
	    order.setUserId(userId);
	    order.setAddressId(addressId);
	    order.setTotalPrice(cartFC.getTotalPrice(userId));
	    order.setOrderTime(LocalDateTime.now());
	    order.setPaymentMethod("Cash on Delivery");
	    order.setPaymentStatus("Pending");
	    order.setPaymentId(0L);
	    order.setOrderStatus("Placed");

	    // 🔹 Save the order first
	    cartOrderRepository.save(order);

	    // 🔹 Attach orderId to each CartItem and save
	    for (CartItem item : cartItems) {
	        item.setOrderId(generatedOrderId);
	        cartItemRepository.save(item);
	    }
	    
	    for (CartItem item : cartItems) {
	        productFC.reduceStock(item.getProductId(), item.getQuantity());
	    }
	    
	    


	    // 🔹 Step 7: Clear cart after order placement
	    cartFC.clearCart(userId);

	    // 🔹 Step 8: Prepare response DTO
	    CartClientDTO cartClientDTO = new CartClientDTO();
	    cartClientDTO.setOrderId(order.getOrderId());
	    cartClientDTO.setUserId(userId);
	    cartClientDTO.setAddressId(addressId);
	    cartClientDTO.setTotalPrice(order.getTotalPrice());
	    cartClientDTO.setItems(cartDTOs); // returning original DTOs for response
	    
	    

	    logger.info("Cart order successfully placed: {}", order.getOrderId());
	    return cartClientDTO;
	}


	@Override
	public Long startCartOnlinePayment(CartClientOnlineDTO orderDTO) {
	    logger.info("Starting cart payment initiation for user ID: {}", orderDTO.getUserId());

	    // 🔹 Step 1: Validate user ID
	    try {
	        ResponseEntity<Integer> response = userFC.getUserId(orderDTO.getUserId());
	        if (response.getBody() == null || response.getBody() == 0) {
	            throw new UserNotFoundException("User does not exist.");
	        }
	    } catch (FeignException fe) {
	        throw new UserNotFoundException("User validation failed.");
	    }

	    // 🔹 Step 2: Validate address ownership
	    List<AddressResponse> addresses = userFC.getUserAddresses(orderDTO.getUserId()).getBody();
	    boolean isValidAddress = addresses != null
	            && addresses.stream().anyMatch(addr -> Objects.equals(addr.getId(), orderDTO.getAddressId()));
	    if (!isValidAddress) {
	        throw new AddressNotFoundException("Provided address does not belong to user.");
	    }

	    // 🔹 Step 3: Validate cart contents
	    List<CartItemDTO> cartItems = cartFC.getCartItems(orderDTO.getUserId());
	    if (cartItems == null || cartItems.isEmpty()) {
	        throw new CartEmptyException("Cart is empty.");
	    }

	    // 🔹 Step 4: Calculate total price
	    double totalPrice = cartFC.getTotalPrice(orderDTO.getUserId());

	    // 🔹 Step 5: Initiate payment
	    PaymentRequestDto paymentRequest = new PaymentRequestDto();
	    paymentRequest.setAmount(totalPrice);
	    paymentRequest.setUpiId(orderDTO.getUpiId());

	    PaymentResponseDto paymentResponse;
	    try {
	        paymentResponse = paymentFC.initiatePayment(paymentRequest);
	    } catch (FeignException fe) {
	        throw new PaymentInitiationException("Payment initiation failed.");
	    }

	    Long paymentId = paymentResponse.getPaymentId();

	    // 🔹 Step 6: Store transaction details temporarily
	    orderDTO.setTotalPrice(totalPrice);
	    orderDTO.setItems(cartItems); // assuming you add this field to OrderDTO
	    tempOrderStoreTwo.save(paymentId, orderDTO);

	    logger.info("Cart payment initiated successfully. Payment ID: {}", paymentId);
	    return paymentId;
	}


	@Override
	public OrderDTO finalizeCartOnlineOrder(Long paymentId) {
	    logger.info("Finalizing cart order for payment ID: {}", paymentId);

	    // Step 1: Retrieve temporarily stored order data
	    CartClientOnlineDTO orderDTO = tempOrderStoreTwo.get(paymentId);
	    if (orderDTO == null) {
	        throw new OrderNotFoundException("No order data found for payment ID: " + paymentId);
	    }

	    // Step 2: Verify payment status
	    String paymentStatus;
	    try {
	        ResponseEntity<String> response = paymentFC.viewPaymentStatus(paymentId);
	        paymentStatus = response.getBody();
	    } catch (FeignException fe) {
	        throw new PaymentInitiationException("Failed to retrieve payment status.");
	    }

	    if (!"SUCCESS".equalsIgnoreCase(paymentStatus)) {
	        throw new PaymentInitiationException("Payment not successful. Order cannot be finalized.");
	    }

	    // Step 3: Convert DTO items to CartItem entities
	    List<CartItem> cartItems = orderDTO.getItems().stream()
	        .map(dto -> {
	            CartItem item = new CartItem();
	            item.setId(dto.getId());
	            item.setProductId(dto.getProductId());
	            item.setQuantity(dto.getQuantity());
	            return item;
	        })
	        .collect(Collectors.toList());

	 // Step 4: Create and save CartOrder entity
	    CartOrder order = new CartOrder();
	    String generatedOrderId = generateUniqueOrderId();

	    order.setOrderId(generatedOrderId);
	    order.setUserId(orderDTO.getUserId());
	    order.setAddressId(orderDTO.getAddressId());
	    order.setTotalPrice(orderDTO.getTotalPrice());
	    order.setOrderTime(LocalDateTime.now());
	    order.setPaymentMethod("Online Payment");
	    order.setPaymentId(paymentId);
	    order.setPaymentStatus(paymentStatus);
	    order.setOrderStatus("Placed");

	    // Save the CartOrder first
	    cartOrderRepository.save(order);

	    // Set orderId in each CartItem and save
	    for (CartItem item : cartItems) {
	        item.setOrderId(generatedOrderId);
	        cartItemRepository.save(item);
	        
	        productFC.reduceStock(item.getProductId(), item.getQuantity());
	    }


	    cartFC.clearCart(orderDTO.getUserId());
	    tempOrderStoreTwo.remove(paymentId);

	    logger.info("Cart order successfully placed with ID: {}", order.getOrderId());

	    // Step 5: Build product summary list using ProductCartDTO from Feign
	    List<ProductSummary> productSummaries = cartItems.stream()
	        .map(item -> {
	            ProductCartDTO product = productFC.getProductById(item.getProductId());
	            ProductSummary summary = new ProductSummary();
	            summary.setProductId(product.getProductID()); // matches ProductCartDTO field
	            summary.setProductName(product.getName());    // matches ProductCartDTO field
	            return summary;
	        })
	        .collect(Collectors.toList());

	    // Step 6: Build and return response DTO
	    int totalQuantity = cartItems.stream().mapToInt(CartItem::getQuantity).sum();
	    double unitPrice = totalQuantity > 0 ? order.getTotalPrice() / totalQuantity : 0;

	    OrderDTO responseDTO = new OrderDTO();
	    responseDTO.setOrderId(order.getOrderId());
	    responseDTO.setUserId(order.getUserId());
	    responseDTO.setOrderStatus(order.getOrderStatus());
	    responseDTO.setPaymentStatus(order.getPaymentStatus());
	    responseDTO.setPaymentId(order.getPaymentId());
	    responseDTO.setOrderAmount(unitPrice);
	    responseDTO.setTotalPrice(order.getTotalPrice());
	    responseDTO.setQuantity(totalQuantity);
	    responseDTO.setAddressId(order.getAddressId());
	    responseDTO.setOrderTime(order.getOrderTime());
	    responseDTO.setUpiId(orderDTO.getUpiId());
	    responseDTO.setProducts(productSummaries); // 🎯 Final product list with names + IDs

	    return responseDTO;
	}

	@Override
	public OrderDTO trackOrderById(String orderId) {
	    logger.info("Tracking order with ID: {}", orderId);

	    // Try direct order lookup first
	    Order order = orderRepository.findByOrderId(orderId);
	    if (order != null) {
	        OrderDTO dto = new OrderDTO();
	        dto.setOrderId(order.getOrderId());
	        dto.setUserId(order.getUserId());
	        dto.setProductId(order.getProductId());
	        dto.setProductName(order.getProductName());
	        dto.setOrderStatus(order.getOrderStatus());
	        dto.setPaymentId(order.getPaymentId());
	        dto.setPaymentStatus(order.getPaymentStatus());
	        dto.setQuantity(order.getQuantity());
	        dto.setTotalPrice(order.getTotalPrice());
	        dto.setOrderAmount(order.getOrderAmount());
	        dto.setAddressId(order.getAddressId());
	        dto.setUpiId("********");
	        dto.setOrderTime(order.getOrderTime());
	        return dto;
	    }

	    // Fallback to cart-based order
	    CartOrder cartOrder = cartOrderRepository.findByOrderId(orderId);
	    if (cartOrder == null) {
	        throw new OrderNotFoundException("No order found with ID: " + orderId);
	    }

	 // Fetch related cart items manually
	    List<CartItem> cartItems = cartItemRepository.findByOrderId(cartOrder.getOrderId());

	    OrderDTO dto = new OrderDTO();
	    dto.setOrderId(cartOrder.getOrderId());
	    dto.setUserId(cartOrder.getUserId());
	    dto.setOrderStatus(cartOrder.getOrderStatus());
	    dto.setPaymentStatus(cartOrder.getPaymentStatus());
	    dto.setOrderAmount(cartOrder.getTotalPrice());
	    dto.setAddressId(cartOrder.getAddressId());
	    dto.setUpiId("********");
	    dto.setOrderTime(cartOrder.getOrderTime());

	    // Quantity as sum of cart items
	    dto.setQuantity(cartItems.stream()
	        .mapToInt(CartItem::getQuantity)
	        .sum());

	    // Since CartItem doesn't store product names, we fallback to a generic label
	    dto.setProductName("Multiple items");

	    return dto;

	}
	
	@Override
	public Map<String, ProductStats> getOverallProductStats() {
	    Map<String, ProductStats> stats = new HashMap<>();
	    LocalDate today = LocalDate.now();

	    // 🔹 1. Pre-fill with all available products (zeroed stats)
	    try {
	        List<ProductCartDTO> allProducts = productFC.getProductSummaries();
	        for (ProductCartDTO product : allProducts) {
	            stats.put(product.getName(), new ProductStats());
	        }
	    } catch (Exception e) {
	        System.out.println("❌ Failed to fetch product list from ProductFC: " + e.getMessage());
	    }

	    // 🔹 2. Direct orders
	    for (Order o : orderRepository.findAll()) {
	        String name = o.getProductName();
	        int qty = o.getQuantity();
	        LocalDate date = o.getOrderTime().toLocalDate();

	        stats.computeIfAbsent(name, k -> new ProductStats());
	        ProductStats s = stats.get(name);

	        long days = ChronoUnit.DAYS.between(date, today);
	        if (days <= 7) s.setWeek(s.getWeek() + qty);
	        if (days <= 30) s.setMonth(s.getMonth() + qty);
	        if (days <= 365) s.setYear(s.getYear() + qty);
	    }

	    // 🔹 3. Cart orders
	    for (CartOrder co : cartOrderRepository.findAll()) {
	        LocalDate date = co.getOrderTime().toLocalDate();
	        List<CartItem> items = cartItemRepository.findByOrderId(co.getOrderId());

	        for (CartItem item : items) {
	            String name;
	            try {
	                ProductCartDTO product = productFC.getProductById(item.getProductId());
	                name = product.getName();
	            } catch (Exception e) {
	                name = "Unknown Product";
	            }

	            int qty = item.getQuantity();

	            stats.computeIfAbsent(name, k -> new ProductStats());
	            ProductStats s = stats.get(name);

	            long days = ChronoUnit.DAYS.between(date, today);
	            if (days <= 7) s.setWeek(s.getWeek() + qty);
	            if (days <= 30) s.setMonth(s.getMonth() + qty);
	            if (days <= 365) s.setYear(s.getYear() + qty);
	        }
	    }

	    return stats;
	}
	
	@Override
	public Map<String, ProductStats> getGenderStats() {
	    Map<String, ProductStats> genderStats = new HashMap<>();
	    genderStats.put("Men", new ProductStats());
	    genderStats.put("Women", new ProductStats());
	    genderStats.put("Unisex", new ProductStats());

	    LocalDate today = LocalDate.now();

	    // 🔹 Direct Orders
	    for (Order o : orderRepository.findAll()) {
	        int productId = o.getProductId(); // Ensure this exists
	        int qty = o.getQuantity();
	        LocalDate date = o.getOrderTime().toLocalDate();

	        try {
	            ProductCartDTO product = productFC.getProductById(productId);
	            String gender = product.getGender();

	            ProductStats stats = genderStats.computeIfAbsent(gender, k -> new ProductStats());
	            long days = ChronoUnit.DAYS.between(date, today);
	            if (days <= 7) stats.setWeek(stats.getWeek() + qty);
	            if (days <= 30) stats.setMonth(stats.getMonth() + qty);
	            if (days <= 365) stats.setYear(stats.getYear() + qty);
	        } catch (Exception e) {
	            System.out.println("❌ Failed to fetch product for ID: " + productId);
	        }
	    }

	    // 🔹 Cart Orders
	    for (CartOrder co : cartOrderRepository.findAll()) {
	        LocalDate date = co.getOrderTime().toLocalDate();
	        List<CartItem> items = cartItemRepository.findByOrderId(co.getOrderId());

	        for (CartItem item : items) {
	            int productId = item.getProductId();
	            int qty = item.getQuantity();

	            try {
	            	ProductCartDTO product = productFC.getProductById(productId);
	                String gender = product.getGender();

	                ProductStats stats = genderStats.computeIfAbsent(gender, k -> new ProductStats());
	                long days = ChronoUnit.DAYS.between(date, today);
	                if (days <= 7) stats.setWeek(stats.getWeek() + qty);
	                if (days <= 30) stats.setMonth(stats.getMonth() + qty);
	                if (days <= 365) stats.setYear(stats.getYear() + qty);
	            } catch (Exception e) {
	                System.out.println("❌ Failed to fetch product for ID: " + productId);
	            }
	        }
	    }

	    return genderStats;
	}


	




}