package com.cts.exception;

public class RefundProcessingException extends RuntimeException {
    public RefundProcessingException(String message) {
        super(message);
    }

    public RefundProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}

