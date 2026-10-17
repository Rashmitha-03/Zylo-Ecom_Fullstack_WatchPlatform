package com.cts.repository;

import com.cts.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Order findByOrderId(String orderId);
    List<Order> findByOrderStatus(String orderStatus);
    List<Order> findByUserId(int userId);
    List<Order> findByOrderStatusIgnoreCase(String orderStatus);

}

