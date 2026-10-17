package com.cts.exception;

import com.cts.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.stream.Collectors;

// NEW IMPORTS for Spring Security Exceptions
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.BadCredentialsException; // Often thrown for invalid password

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles validation errors thrown by @Valid annotation on DTOs.
     * Returns a 400 Bad Request with a map of field errors, wrapped in ErrorResponse.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        String errorMessage = ex.getBindingResult().getAllErrors().stream()
                .filter(error -> error instanceof FieldError)
                .map(error -> ((FieldError) error).getField() + ": " + Objects.requireNonNull(error.getDefaultMessage()))
                .collect(Collectors.joining("; ")); // Join messages for a single string in ErrorResponse

        HttpStatus status = HttpStatus.BAD_REQUEST;
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                "Validation Error",
                errorMessage,
                request.getDescription(false).replace("uri=", "") // Extract path
        );
        logger.warn("GlobalExceptionHandler: Validation error occurred. Errors: {}", errorMessage);
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Handles UserNotFoundException, returning a 404 Not Found status.
     * (This will now primarily be for cases where user is truly not found, not inactive/blocked)
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex, WebRequest request) {
        HttpStatus status = HttpStatus.NOT_FOUND; // Default to 404 Not Found

        // Keep this handler, but it should now only apply if the user is genuinely not found.
        // Inactive/blocked users are handled by DisabledException/LockedException.
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        logger.warn("GlobalExceptionHandler: UserNotFoundException. Status: {}, Message: {}", status.value(), ex.getMessage());
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Handles DisabledException (e.g., account is inactive).
     * Returns a 401 Unauthorized status.
     */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabledException(DisabledException ex, WebRequest request) {
        HttpStatus status = HttpStatus.UNAUTHORIZED; // 401 Unauthorized for authentication failure
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                "Account Disabled", // More specific error type
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        logger.warn("GlobalExceptionHandler: Account Disabled. Message: {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Handles LockedException (e.g., account is blocked due to too many failed attempts).
     * Returns a 401 Unauthorized status.
     */
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorResponse> handleLockedException(LockedException ex, WebRequest request) {
        HttpStatus status = HttpStatus.UNAUTHORIZED; // 401 Unauthorized for authentication failure
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                "Account Locked", // More specific error type
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        logger.warn("GlobalExceptionHandler: Account Locked. Message: {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Handles BadCredentialsException (e.g., invalid password).
     * Returns a 401 Unauthorized status.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex, WebRequest request) {
        HttpStatus status = HttpStatus.UNAUTHORIZED; // 401 Unauthorized for invalid credentials
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                "Bad Credentials",
                ex.getMessage(), // Usually "Bad credentials"
                request.getDescription(false).replace("uri=", "")
        );
        logger.warn("GlobalExceptionHandler: Bad Credentials. Message: {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Handles AddressNotFoundException, returning a 404 Not Found status.
     * Returns a structured ErrorResponse.
     */
    @ExceptionHandler(AddressNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAddressNotFoundException(AddressNotFoundException ex, WebRequest request) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        logger.warn("GlobalExceptionHandler: Address not found. Message: {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Handles EmailAlreadyExistsException, returning a 409 Conflict status.
     * Returns a structured ErrorResponse.
     */
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExistsException(EmailAlreadyExistsException ex, WebRequest request) {
        HttpStatus status = HttpStatus.CONFLICT;
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        logger.warn("GlobalExceptionHandler: Email already exists. Message: {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Generic handler for IllegalArgumentException, often used for business logic errors.
     * Returns a 400 Bad Request. Returns a structured ErrorResponse.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        logger.warn("GlobalExceptionHandler: Invalid argument. Message: {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Catch-all for any other RuntimeExceptions that might be thrown from the service layer.
     * This provides a consistent way to handle unexpected business logic failures.
     * Returns a structured ErrorResponse.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                "An unexpected runtime error occurred: " + ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        logger.error("GlobalExceptionHandler: Unhandled RuntimeException occurred. Message: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Fallback handler for any other unhandled Exceptions, ensuring no unhandled exceptions
     * leak internal server details. Returns a structured ErrorResponse.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                "An internal server error occurred.",
                request.getDescription(false).replace("uri=", "")
        );
        logger.error("GlobalExceptionHandler: Catch-all Exception occurred. Message: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(errorResponse, status);
    }
}
