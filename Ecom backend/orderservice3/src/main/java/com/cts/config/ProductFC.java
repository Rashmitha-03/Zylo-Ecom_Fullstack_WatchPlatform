package com.cts.config;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductStockDTO;

@FeignClient(name="Project",configuration = FeignClientConfig.class)
public interface ProductFC {
		@GetMapping("/api/ecom/products/getStockAvailability")
		ProductStockDTO getProductStockAvailabity(@RequestParam("productId") int productId);	 
		
		@GetMapping("/api/ecom/products/getSummaries")
	    public List<ProductCartDTO> getProductSummaries();
	
		@PutMapping("/api/ecom/products/{productId}/reduceStock/{quantity}")
		   public String reduceStock(@PathVariable int productId, @PathVariable int quantity);
		
		 @PutMapping("/api/ecom/products/{productId}/updateStock/{quantity}")
		   public String updateStock(@PathVariable int productId, @PathVariable int quantity) ;
		 
		 @GetMapping("/api/ecom/getProductById/{id}")
		public ProductCartDTO getProductById(@PathVariable("id") int productId);


}
