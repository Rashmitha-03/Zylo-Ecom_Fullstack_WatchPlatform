package com.cts.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.entity.Cart;
import com.cts.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Integer>{
	List<CartItem> findByCart(Cart cart);
	Optional<CartItem> findByCartAndProductId(Cart cart, Integer productId);

}


