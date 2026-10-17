package ProductServiceTest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cts.entity.Feedback;
import com.cts.entity.Product;
import com.cts.dto.ProductDto;
import com.cts.dto.ProductStockDTO;
import com.cts.dto.FeedbackDto;
import com.cts.dto.ProductAddDTO;
import com.cts.dto.ProductCartDTO;
import com.cts.repository.ProductRepository;
import com.cts.service.ProductServiceImpl;
import org.modelmapper.ModelMapper;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private ProductServiceImpl productService;

     
    @Test
    void testGetProductById_Success() {
        Product mockProduct = new Product();
        mockProduct.setProductID(1);
        mockProduct.setName("Laptop");
        mockProduct.setActive(true);

        when(productRepository.findById(1)).thenReturn(Optional.of(mockProduct));
        when(modelMapper.map(mockProduct, ProductDto.class)).thenReturn(new ProductDto());

        ProductDto result = productService.getProductById(1);

        assertNotNull(result);
        verify(productRepository, times(1)).findById(1);
    }

    @Test
    void testGetProductById_NotFound() {
        when(productRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> productService.getProductById(1));
        verify(productRepository, times(1)).findById(1);
    }

    // ✅ Test for addProduct()
    @Test
    void testAddProduct() {
        Product mockProduct = new Product();
        mockProduct.setProductID(1);
        mockProduct.setName("Laptop");

        ProductAddDTO dto = new ProductAddDTO();
        dto.setName("Laptop");

        when(modelMapper.map(dto, Product.class)).thenReturn(mockProduct);
        when(productRepository.save(mockProduct)).thenReturn(mockProduct);
        when(modelMapper.map(mockProduct, ProductDto.class)).thenReturn(new ProductDto());

        ProductDto result = productService.addProduct(dto);

        assertNotNull(result);
        verify(productRepository, times(1)).save(mockProduct);
    }

    // ✅ Test for updateProduct()
    @Test
    void testUpdateProduct() {
        Product mockProduct = new Product();
        mockProduct.setProductID(1);

        ProductAddDTO dto = new ProductAddDTO();
        dto.setName("Updated Laptop");

        when(productRepository.findById(1)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(mockProduct)).thenReturn(mockProduct);
        when(modelMapper.map(mockProduct, ProductDto.class)).thenReturn(new ProductDto());

        ProductDto result = productService.updateProduct(1, dto);

        assertNotNull(result);
        verify(productRepository, times(1)).findById(1);
        verify(productRepository, times(1)).save(mockProduct);
    }

    // ✅ Test for deleteProduct()
    @Test
    void testDeleteProduct() {
        int productId = 1;
        doNothing().when(productRepository).deleteById(productId);

        String result = productService.deleteProduct(productId);

        assertEquals("Deleted Successfully", result);
        verify(productRepository, times(1)).deleteById(productId);
    }

    // ✅ Test for getAllProducts()
    @Test
    void testGetAllProducts() {
        List<Product> mockProducts = Arrays.asList(new Product(), new Product());
        when(productRepository.findAllActiveProducts()).thenReturn(mockProducts);
        when(modelMapper.map(any(Product.class), eq(ProductDto.class))).thenReturn(new ProductDto());

        List<ProductDto> result = productService.getAllProducts();

        assertEquals(2, result.size());
        verify(productRepository, times(1)).findAllActiveProducts();
    }

    // ✅ Test for filterByAttribute()
    @Test
    void testFilterByAttribute() {
        List<Product> mockProducts = Arrays.asList(new Product(), new Product());
        when(productRepository.findActiveProductsByPriceRange(anyDouble(), anyDouble())).thenReturn(mockProducts);
        when(modelMapper.map(any(Product.class), eq(ProductDto.class))).thenReturn(new ProductDto());

        List<ProductDto> result = productService.filterByAttribute(1000.0, 5000.0, null, null, null, null, null);

        assertEquals(2, result.size());
        verify(productRepository, times(1)).findActiveProductsByPriceRange(anyDouble(), anyDouble());
    }

    // ✅ Test for softDeleteProduct()
    @Test
    void testSoftDeleteProduct() {
        Product mockProduct = new Product();
        mockProduct.setProductID(1);
        mockProduct.setActive(true);

        when(productRepository.findById(1)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(mockProduct)).thenReturn(mockProduct);

        String result = productService.softDeleteProduct(1);

        assertEquals("Product soft-deleted successfully.", result);
        verify(productRepository, times(1)).findById(1);
        verify(productRepository, times(1)).save(mockProduct);
    }

    // ✅ Test for restoreProduct()
    @Test
    void testRestoreProduct() {
        Product mockProduct = new Product();
        mockProduct.setProductID(1);
        mockProduct.setActive(false);

        when(productRepository.findById(1)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(mockProduct)).thenReturn(mockProduct);

        String result = productService.restoreProduct(1);

        assertEquals("Product restored successfully.", result);
        verify(productRepository, times(1)).findById(1);
        verify(productRepository, times(1)).save(mockProduct);
    }
    
 // ✅ Test for reduceStock()
    @Test
    void testReduceStock_Success() {
        Product mockProduct = new Product();
        mockProduct.setProductID(1);
        mockProduct.setStock(10);

        when(productRepository.findById(1)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(mockProduct)).thenReturn(mockProduct);

        productService.reduceStock(1, 5);

        assertEquals(5, mockProduct.getStock()); // Stock should decrease
        verify(productRepository, times(1)).save(mockProduct);
    }

    @Test
    void testReduceStock_InsufficientStock() {
        Product mockProduct = new Product();
        mockProduct.setProductID(1);
        mockProduct.setStock(3);

        when(productRepository.findById(1)).thenReturn(Optional.of(mockProduct));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            productService.reduceStock(1, 5); // Trying to reduce more than available stock
        });

        assertEquals("Insufficient stock available", exception.getMessage());
        verify(productRepository, never()).save(mockProduct); // Ensure save was never called
    }

    // ✅ Test for updateStock()
    @Test
    void testUpdateStock_Success() {
        Product mockProduct = new Product();
        mockProduct.setProductID(1);
        mockProduct.setStock(10);

        when(productRepository.findById(1)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(mockProduct)).thenReturn(mockProduct);

        productService.updateStock(1, 20);

        assertEquals(30, mockProduct.getStock()); // 10 + 20 = 30
        verify(productRepository, times(1)).save(mockProduct);
    }

    
    
    
    @Test
    void testSearchByName() {
        List<Product> mockProducts = List.of(new Product(1, "Laptop", 1000.0));
        ProductDto mockDto = new ProductDto(1, "Laptop", 1000.0);

        Mockito.when(productRepository.findByNameContainingIgnoreCase("Laptop")).thenReturn(mockProducts);
        Mockito.when(modelMapper.map(any(Product.class), eq(ProductDto.class))).thenReturn(mockDto);

        List<ProductDto> results = productService.searchByName("Laptop");

        assertEquals(1, results.size());
        assertEquals("Laptop", results.get(0).getName());
    }


   
    @Test
    void testAddFeedback() {
        Product product = new Product(1, "Phone", 500.0);
        product.setFeedbacks(new ArrayList<>()); // Ensure feedback list is initialized

        Mockito.when(productRepository.findById(1)).thenReturn(Optional.of(product));
        Mockito.when(productRepository.save(product)).thenReturn(product); // Mock save method

        FeedbackDto feedbackDto = new FeedbackDto("Great phone!", 5, LocalDateTime.now());
        String result = productService.addFeedback(1, feedbackDto);

        assertEquals("Feedback added successfully!", result);
        verify(productRepository, times(1)).save(product); // Ensure save is called
    }


    // ✅ Test: Get Feedback for a Product
    @Test
    void testGetFeedbackByProduct() {
        Product product = new Product(1, "Headphones", 150.0);
        Feedback feedback = new Feedback("Nice sound", 5, LocalDateTime.now());
        product.setFeedbacks(List.of(feedback));

        Mockito.when(productRepository.findById(1)).thenReturn(Optional.of(product));

        List<FeedbackDto> feedbackList = productService.getFeedbackByProduct(1);

        assertEquals(1, feedbackList.size());
        assertEquals("Nice sound", feedbackList.get(0).getReviewText());
    }

    // ✅ Test: Get Stock Availability
    @Test
    void testGetProductStockAvailability() {
        Product product = new Product(1, "Keyboard", 50); // Fix constructor issue

        Mockito.when(productRepository.findByProductIDAndActiveTrue(1))
               .thenReturn(Optional.of(product));

        ProductStockDTO stock = productService.getProductStockAvailabity(1);

        assertEquals(50, stock.getAvailableStock()); // Ensure stock is correctly retrieved
        verify(productRepository, times(1)).findByProductIDAndActiveTrue(1); // Ensure repository call happens
    }


    // ✅ Test: Get Product Summaries
    @Test
    void testGetProductSummaries() {
        Product product = new Product(1, "Mouse", 40.0);
        Mockito.when(productRepository.findAllActiveProducts()).thenReturn(List.of(product));

        List<ProductCartDTO> summaries = productService.getProductSummaries();

        assertEquals(1, summaries.size());
        assertEquals("Mouse", summaries.get(0).getName());
        assertEquals(40, summaries.get(0).getPrice());
    }
}
