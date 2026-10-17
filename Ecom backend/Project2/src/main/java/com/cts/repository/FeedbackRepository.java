package com.cts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.entity.Feedback;
import com.cts.entity.Product;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

	Product findById(int id);
}
