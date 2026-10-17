package com.cts.exception;

public class OrderReplacementException extends RuntimeException {
    public OrderReplacementException(String message) {
        super(message);
    }

    public OrderReplacementException(String message, Throwable cause) {
        super(message, cause);
    }
}

