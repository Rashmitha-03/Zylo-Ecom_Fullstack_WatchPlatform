package com.cts.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class FeedbackDto {
    private String reviewText;  // Customer's feedback
    private int rating; // Star rating (1 to 5)
    private LocalDateTime createdTime; // Time when feedback was submitted

    public FeedbackDto(String reviewText, int rating, LocalDateTime createdTime) {
        this.reviewText = reviewText;
        this.rating = rating;
        this.createdTime = createdTime;
    }
}
