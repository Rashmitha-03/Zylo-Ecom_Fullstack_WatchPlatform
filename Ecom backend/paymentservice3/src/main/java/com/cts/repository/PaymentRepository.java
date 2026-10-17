package com.cts.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cts.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long>{
	boolean existsByPaymentId(Long paymentId);
	List<Payment> findByStatusAndCreatedAtBefore(String status, LocalDateTime createdAt);
}
