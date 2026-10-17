package com.cts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.cts.entity.CartOrder;

public interface CartOrderRepository extends JpaRepository<CartOrder, String> {

    CartOrder findByOrderId(String orderId);

    // ✅ Find orders by user ID
    List<CartOrder> findByUserId(int userId);

    // ✅ Find orders by status (case-insensitive)
    List<CartOrder> findByOrderStatusIgnoreCase(String orderStatus);
}
