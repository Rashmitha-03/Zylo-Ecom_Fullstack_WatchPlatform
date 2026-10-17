package com.cts;

import com.cts.dto.PaymentRequestDto;
import com.cts.dto.PaymentResponseDto;
import com.cts.entity.Payment;
import com.cts.exception.PaymentException;
import com.cts.repository.PaymentRepository;
import com.cts.service.PaymentServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@SpringBootTest
@ExtendWith(MockitoExtension.class)
class ECommercePaymentServiceApplicationTests {

	    @Mock
	    private PaymentRepository paymentRepository;

	    @Mock
	    private ModelMapper modelMapper;

	    @InjectMocks
	    private PaymentServiceImpl paymentService;

	    private PaymentRequestDto requestDto;
	    private Payment payment;

	    @BeforeEach
	    public void setup() {
	        requestDto = new PaymentRequestDto();
	        requestDto.setUpiId("test@upi");
	        requestDto.setAmount(100.0);

	        payment = new Payment();
	        payment.setPaymentId(12345L);
	        payment.setCreatedAt(LocalDateTime.now());
	        payment.setStatus("PENDING");
	    }
	    
	    @Test
	    public void testUpdatePaymentStatus_Success() {
	        payment.setCreatedAt(LocalDateTime.now().minusSeconds(100));
	        when(paymentRepository.findById(12345L)).thenReturn(Optional.of(payment));

	        String status = paymentService.updatePaymentStatus(12345L, false);

	        assertEquals("SUCCESS", status);
	        verify(paymentRepository).save(payment);
	    }

	    @Test
	    public void testUpdatePaymentStatus_Cancelled() {
	        payment.setCreatedAt(LocalDateTime.now().minusSeconds(100));
	        when(paymentRepository.findById(12345L)).thenReturn(Optional.of(payment));

	        String status = paymentService.updatePaymentStatus(12345L, true);

	        assertEquals("CANCELLED", status);
	        verify(paymentRepository).save(payment);
	    }

	    @Test
	    public void testUpdatePaymentStatus_Failed() {
	        payment.setCreatedAt(LocalDateTime.now().minusSeconds(200));
	        when(paymentRepository.findById(12345L)).thenReturn(Optional.of(payment));

	        String status = paymentService.updatePaymentStatus(12345L, false);

	        assertEquals("FAILED", status);
	        verify(paymentRepository).save(payment);
	    }

	    @Test
	    public void testUpdatePaymentStatus_NotFound() {
	        when(paymentRepository.findById(12345L)).thenReturn(Optional.empty());

	        PaymentException exception = assertThrows(PaymentException.class, () -> {
	            paymentService.updatePaymentStatus(12345L, false);
	        });

	        assertEquals("Payment ID 12345 not found in database!", exception.getMessage());
	    }

	    @Test
	    public void testUpdatePaymentStatus_InvalidStatus() {
	        payment.setStatus("SUCCESS");
	        when(paymentRepository.findById(12345L)).thenReturn(Optional.of(payment));

	        PaymentException exception = assertThrows(PaymentException.class, () -> {
	            paymentService.updatePaymentStatus(12345L, false);
	        });

	        assertEquals("Payment status must be PENDING to update, found: SUCCESS", exception.getMessage());
	    }

	    @Test
	    public void testViewPaymentStatus_Success() {
	        when(paymentRepository.findById(12345L)).thenReturn(Optional.of(payment));

	        String status = paymentService.viewPaymentStatus(12345L);

	        assertEquals("PENDING", status);
	    }

	    @Test
	    public void testViewPaymentStatus_NotFound() {
	        when(paymentRepository.findById(12345L)).thenReturn(Optional.empty());

	        PaymentException exception = assertThrows(PaymentException.class, () -> {
	            paymentService.viewPaymentStatus(12345L);
	        });

	        assertEquals("Payment ID 12345 not found in database!", exception.getMessage());
	    }

	    @Test
	    public void testGenerateUpiUri_MissingUpiId() {
	        requestDto.setUpiId(null);
	        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
	            paymentService.generateUpiUri(requestDto);
	        });
	        assertEquals("UPI ID and Name must not be null.", exception.getMessage());
	    }
	}
