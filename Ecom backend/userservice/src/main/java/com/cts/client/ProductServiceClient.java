package com.cts.client;

import com.cts.dto.FeedbackDto;
import com.cts.dto.ProductAddDTO;
import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "Product", url = "${product-service.url:http://localhost:8081}") 
public interface ProductServiceClient {

 // Matches @PostMapping("/addProduct")
 @PostMapping("/api/ecom/addProduct")
 ProductDto addProduct(@RequestBody ProductAddDTO dto);

 // Matches @PutMapping("/updateProduct/{id}")
 @PutMapping("/api/ecom/updateProduct/{id}")
 ProductDto updateProduct(@PathVariable("id") int id, @RequestBody ProductAddDTO dto);

 // Matches @DeleteMapping("/deleteProduct/{id}")
 @DeleteMapping("/api/ecom/deleteProduct/{id}")
 String deleteProduct(@PathVariable("id") int id);

 // Matches @GetMapping("/getProductById/{id}")
 @GetMapping("/api/ecom/getProductById/{id}")
 ProductDto getProductById(@PathVariable("id") int id);

 // Matches @GetMapping("/get")
 @GetMapping("/api/ecom/get")
 List<ProductDto> getAllProducts();

 // Matches @GetMapping("/search")
 @GetMapping("/api/ecom/search")
 List<ProductDto> searchByName(@RequestParam("keyword") String keyword);

 // Matches @GetMapping("/filter")
 @GetMapping("/api/ecom/filter")
 List<ProductDto> filter(
         @RequestParam("minPrice") Double minPrice,
         @RequestParam("maxPrice") Double maxPrice,
         @RequestParam(value = "type", required = false) String type,
         @RequestParam(value = "gender", required = false) String gender,
         @RequestParam(value = "color", required = false) String color,
         @RequestParam(value = "material", required = false) String material,
         @RequestParam(value = "name", required = false) String name
 );

 // Matches @PutMapping("/products/{id}/soft-delete")
 @PutMapping("/api/ecom/products/{id}/soft-delete")
 String softDeleteProduct(@PathVariable("id") int id);

 // Matches @PutMapping("/products/{id}/restore")
 @PutMapping("/api/ecom/products/{id}/restore")
 String restoreProduct(@PathVariable("id") int id);

 // Matches @PostMapping("/products/{productId}/feedback")
 @PostMapping("/api/ecom/products/{productId}/feedback")
 String addFeedback(@PathVariable("productId") int productId, @RequestBody FeedbackDto feedbackDto);

 // Matches @GetMapping("/products/{productId}/feedback")
 @GetMapping("/api/ecom/products/{productId}/feedback")
 List<FeedbackDto> getFeedbackByProduct(@PathVariable("productId") int productId);

 // Matches @PutMapping("/products/{productId}/reduceStock/{quantity}")
 @PutMapping("/api/ecom/products/{productId}/reduceStock/{quantity}")
 String reduceStock(@PathVariable("productId") int productId, @PathVariable("quantity") int quantity);

 // Matches @PutMapping("/products/{productId}/updateStock/{quantity}")
 @PutMapping("/api/ecom/products/{productId}/updateStock/{quantity}")
 String updateStock(@PathVariable("productId") int productId, @PathVariable("quantity") int quantity);

 // Matches @GetMapping("/products/getProductForCart")
 // Note: Your controller method uses `int id` directly, but it's a @RequestParam implicitly.
 // Explicitly marking it as @RequestParam("id") is good practice for clarity.
 @GetMapping("/api/ecom/products/getProductForCart")
 ProductCartDTO getProductForCart(@RequestParam("id") int id);
}