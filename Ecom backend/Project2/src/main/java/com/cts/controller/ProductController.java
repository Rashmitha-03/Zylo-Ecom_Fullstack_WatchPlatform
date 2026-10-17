package com.cts.controller;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cts.dto.FeedbackDto;
import com.cts.dto.ProductAddDTO;
import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductDto;
import com.cts.dto.ProductStockDTO;
import com.cts.service.IProductService;

import org.springframework.web.bind.annotation.RequestBody;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ecom")
@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
public class ProductController {

    private final IProductService productService;

    // --- Publicly Accessible Endpoints ---

    @GetMapping("/getAllProducts")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/getProductById/{id}")
//    @PreAuthorize("permitAll()")
    public ResponseEntity<ProductDto> getProductById(@PathVariable int id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/searchByName")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProductDto>> searchByName(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchByName(keyword));
    }

    @GetMapping("/filter")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProductDto>> filter(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(productService.filterByAttribute(minPrice, maxPrice, type, gender, color, material, name));
    }

    @GetMapping("/products/getStockAvailability")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ProductStockDTO> getProductStockAvailability(@RequestParam Integer productId) {
        return ResponseEntity.ok(productService.getProductStockAvailabity(productId));
    }

    @GetMapping("/products/getProductForCart")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ProductCartDTO> getProductForCart(@RequestParam int id) {
        return ResponseEntity.ok(productService.getProductForCart(id));
    }

    @GetMapping("/products/getSummaries")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProductCartDTO>> getProductSummaries() {
        return ResponseEntity.ok(productService.getProductSummaries());
    }

    @GetMapping("/products/{productId}/getFeedbackByProduct")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<FeedbackDto>> getFeedbackByProduct(@PathVariable int productId) {
        return ResponseEntity.ok(productService.getFeedbackByProduct(productId));
    }

    @PostMapping("/products/{productId}/addFeedback")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> addFeedback(@PathVariable int productId, @RequestBody FeedbackDto feedbackDto) {
        return ResponseEntity.ok(productService.addFeedback(productId, feedbackDto));
    }

    // --- Admin-Only Endpoints ---

    @PostMapping("/addProduct")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> addProduct(@RequestBody ProductAddDTO dto) {
        return ResponseEntity.ok(productService.addProduct(dto));
    }

    @PutMapping("/updateProduct/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable int id, @RequestBody ProductAddDTO dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @DeleteMapping("/deleteProduct/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @PutMapping("/products/{id}/soft-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> softDeleteProduct(@PathVariable int id) {
        return ResponseEntity.ok(productService.softDeleteProduct(id));
    }

    @PutMapping("/products/{id}/restoreProduct")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> restoreProduct(@PathVariable int id) {
        return ResponseEntity.ok(productService.restoreProduct(id));
    }

    @PutMapping("/products/{productId}/reduceStock/{quantity}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<String> reduceStock(@PathVariable int productId, @PathVariable int quantity) {
        productService.reduceStock(productId, quantity);
        return ResponseEntity.ok("Stock reduced successfully");
    }

    @PutMapping("/products/{productId}/updateStock/{quantity}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<String> updateStock(@PathVariable int productId, @PathVariable int quantity) {
        productService.updateStock(productId, quantity);
        return ResponseEntity.ok("Stock updated successfully");
    }
    
    @GetMapping("/admin/getAllProductsforAdmin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDto>> getAllProductsForAdmin() {
        return ResponseEntity.ok(productService.getAllProductsForAdmin());
    }

}
