package com.cts.exception;

public class OrderReturnException extends RuntimeException {
    public OrderReturnException(String message) {
        super(message);
    }

    public OrderReturnException(String message, Throwable cause) {
        super(message, cause);
    }
}
