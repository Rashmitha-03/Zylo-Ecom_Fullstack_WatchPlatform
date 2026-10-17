package com.cts.config;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.cts.dto.ProductCartDTO;
import com.cts.dto.ProductDto;
import com.cts.dto.ProductStockDTO;

@FeignClient(name = "Project")
public interface ProductFC {

	@GetMapping("/api/ecom/products/getStockAvailability")
	ProductStockDTO getProductStockAvailabity(@RequestParam("productId") Integer productId);

	@GetMapping("/api/ecom/getAllProducts")
	public List<ProductDto> getAllProducts();
	
	@GetMapping("/api/ecom/products/getSummaries") 
    public List<ProductCartDTO> getProductSummaries();

}

