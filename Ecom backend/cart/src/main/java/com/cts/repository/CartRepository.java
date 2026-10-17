package com.cts.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cts.entity.Cart;

public interface CartRepository extends JpaRepository<Cart,Integer> {
	Optional<Cart> findByUserId(int userId);

}
