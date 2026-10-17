package com.cts.service;

import com.cts.dto.PaymentRequestDto;
import com.cts.dto.PaymentResponseDto;
import com.cts.entity.Payment;
import com.cts.exception.PaymentException;
import com.cts.repository.PaymentRepository;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = Logger.getLogger(PaymentServiceImpl.class.getName());

    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ModelMapper modelMapper;
    @Override
    @Transactional
    public PaymentResponseDto initiatePayment(PaymentRequestDto requestDto) {
        try {
            // Validate required fields
            if (requestDto.getUpiId() == null ) {
                throw new IllegalArgumentException("UPI ID and Name must not be null.");
            }

            // Map request DTO to entity
            Payment payment = modelMapper.map(requestDto, Payment.class);
            payment.setPaymentId(generateUniquePaymentId());
            payment.setCreatedAt(LocalDateTime.now());
            payment.setStatus("PENDING");
           


            // Save to database
            payment = paymentRepository.save(payment);

            // Generate UPI URI for response
            String upiUri = generateUpiUri(requestDto);

            // Map entity to response DTO
            PaymentResponseDto responseDto = modelMapper.map(payment, PaymentResponseDto.class);
            responseDto.setUpiUri(upiUri);

           // logger.info("Payment initiated successfully with ID: {}", payment.getPaymentId());
            return responseDto;

        } catch (Exception e) {
          //  logger.error("Error during payment initiation: {}", e.getMessage(), e);
            throw new RuntimeException("Payment initiation failed: " + e.getMessage());
        }
    }

    @Override
    public String updatePaymentStatus(Long paymentId, boolean isCancelled) {
        Optional<Payment> optionalPayment = paymentRepository.findById(paymentId);
        if (optionalPayment.isEmpty()) {
            throw new PaymentException("Payment ID " + paymentId + " not found in database!");
        }
        Payment payment = optionalPayment.get();
        if (!"PENDING".equals(payment.getStatus())) {
            throw new PaymentException("Payment status must be PENDING to update, found: " + payment.getStatus());
        }
        Duration duration = Duration.between(payment.getCreatedAt(), LocalDateTime.now());

        String finalStatus;
        if (duration.getSeconds()>180) {
            payment.setStatus("FAILED");
            finalStatus = "FAILED";
            logger.warning("Payment ID " + paymentId + " update attempted after 180 seconds. Marked as FAILED.");
        } else if (isCancelled) {
            payment.setStatus("CANCELLED");
            finalStatus = "CANCELLED";
            logger.info("Payment ID " + paymentId + " was cancelled by user within 180 seconds.");
        } else {
            payment.setStatus("SUCCESS");
            finalStatus = "SUCCESS";
            logger.info("Payment status updated to SUCCESS for ID: " + paymentId);
        }

        paymentRepository.save(payment);
        return finalStatus;
    }

    @Override
    public String viewPaymentStatus(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow(() -> new PaymentException("Payment ID " + paymentId + " not found in database!"));
        logger.info("Viewed payment status for ID: " + paymentId + ", Status: " + payment.getStatus());
        return  payment.getStatus();
    }
    private Long generateUniquePaymentId() {
        Long newId;
        do {
            newId = UUID.randomUUID().getMostSignificantBits() & Integer.MAX_VALUE;
            if(newId<0)
            	newId*=-1;
            logger.info("generated payment id is : "+ newId);
        } while (paymentRepository.existsByPaymentId(newId));
        return newId;
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
            .orElseThrow(() -> new PaymentException("Payment ID " + id + " not found"));
    }

    @Override
    public String generateUpiUri(PaymentRequestDto dto) {
        if (dto.getUpiId() == null ) {
            throw new IllegalArgumentException("UPI ID and Name must not be null.");
        }

        return "upi://pay?pa=" + URLEncoder.encode(dto.getUpiId(), StandardCharsets.UTF_8)
             + "&am=" + dto.getAmount()
             + "&cu=INR";
    }
    
    

}
