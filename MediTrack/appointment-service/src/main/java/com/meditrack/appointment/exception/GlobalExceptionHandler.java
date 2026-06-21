package com.meditrack.appointment.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> buildResponse(String message) {
        Map<String, Object> map = new HashMap<>();
        map.put("timestamp", LocalDateTime.now());
        map.put("message", message);
        return map;
    }

    /*
     * Handle DTO validation errors (@Valid)
     * Returns field-wise error messages
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, Object> response = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        response.put("timestamp", LocalDateTime.now());
        response.put("errors", fieldErrors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /*
     * Handle bad input / business rule violations
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(
            BadRequestException ex) {

        return new ResponseEntity<>(
                buildResponse(ex.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    /*
     * Handle not found cases
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex) {

        return new ResponseEntity<>(
                buildResponse(ex.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    /*
     * Handle slot already booked conflict
     */
    @ExceptionHandler(SlotAlreadyBookedException.class)
    public ResponseEntity<Map<String, Object>> handleSlotBooked(
            SlotAlreadyBookedException ex) {

        return new ResponseEntity<>(
                buildResponse(ex.getMessage()),
                HttpStatus.CONFLICT
        );
    }

    /*
     * Handle no available slots
     */
    @ExceptionHandler(SlotNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleSlotUnavailable(
            SlotNotAvailableException ex) {

        return new ResponseEntity<>(
                buildResponse(ex.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
               .body(Map.of(
                   "message", ex.getMessage(),
                   "timestamp", java.time.LocalDateTime.now().toString()
               ));
    }

    /*
     * Fallback handler (any unexpected error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex) {

        return new ResponseEntity<>(
                buildResponse("Internal server error"),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}