package com.cts.controller;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cts.config.ProductFC;
import com.cts.config.UserFC;
import com.cts.dto.CartDTO;
import com.cts.dto.CartItemDTO;
import com.cts.dto.CartSummaryResponse;
import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductDto;
import com.cts.dto.ProductStockDTO;
import com.cts.service.ICartService;

@RestController
//@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/cart")
public class CartController {

    @Autowired
    private ICartService cartService;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private UserFC userFC;
    @Autowired
    private ProductFC productFC;

    public CartController(ICartService cartService, ModelMapper modelMapper) {
        this.cartService = cartService;
        this.modelMapper = modelMapper;
    }

    @PostMapping("/{userId}/addToCart")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<CartDTO> addToCart(@PathVariable int userId, @RequestBody CartItemDTO cartItemDto) {
        return ResponseEntity.ok(cartService.addProductToCart(userId, cartItemDto));
    }

    @PutMapping("/{userId}/increaseCartQuantity/{productId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<CartDTO> increaseProductQuantity(@PathVariable int userId, @PathVariable int productId,
            @RequestParam int quantityToAdd) {
        CartDTO updatedCart = cartService.increaseProductQuantity(userId, productId, quantityToAdd);
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/{userId}/decreaseCartQuantity/{productId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<CartDTO> decreaseProductQuantity(@PathVariable int userId, @PathVariable int productId,
            @RequestParam int quantityToRemove) {
        CartDTO updatedCart = cartService.decreaseProductQuantity(userId, productId, quantityToRemove);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/{userId}/removeFromCart/{productId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<String> removeFromCart(@PathVariable int userId, @PathVariable int productId) {
        cartService.removeProductFromCart(userId, productId);
        return ResponseEntity.ok("Product removed successfully.");
    }

    @DeleteMapping("/{userId}/clearFromCart")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<String> clearCart(@PathVariable int userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared successfully.");
    }

    @PostMapping("/{userId}/createCart")
  //@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> createCart(@PathVariable int userId) {
        try {
            cartService.createCartForUser(userId);
            return ResponseEntity.ok("Cart created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating cart: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}/total-priceOfCart")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Double> getTotalPrice(@PathVariable int userId) {
        double totalPrice = cartService.getTotalPriceForCart(userId);
        return ResponseEntity.ok(totalPrice);
    }

    @GetMapping("/{userId}/viewAllProductsFromCart")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<List<CartItemDTO>> getCartItems(@PathVariable int userId) {
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }

    @GetMapping("/{userId}/cart-breakdown")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<CartSummaryResponse> getCartBreakdown(@PathVariable int userId) {
        CartSummaryResponse summary = cartService.getCartBreakdownForUser(userId);
        return ResponseEntity.ok(summary);
    }
    
    @GetMapping("/product/{productId}/stock")
    public ResponseEntity<ProductStockDTO> checkProductStock(@PathVariable int productId) {
        ProductStockDTO stockDTO = productFC.getProductStockAvailabity(productId);
        return ResponseEntity.ok(stockDTO);
    }
    	    	 
    @GetMapping("/product/View_Products_available")
    public ResponseEntity<List<ProductDto>> getAllProductsFromProductService() {
        List<ProductDto> products = productFC.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/product/getsummaries")
    public ResponseEntity<List<ProductCartDTO>> getProductSummaries() {
        return ResponseEntity.ok(productFC.getProductSummaries());
    }
}
