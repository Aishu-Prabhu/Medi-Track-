package com.meditrack.appointment.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleValidationErrors() {

        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(new Object(), "object");

        bindingResult.addError(
                new FieldError(
                        "object",
                        "email",
                        "Email is required"
                )
        );

        MethodArgumentNotValidException ex =
                mock(MethodArgumentNotValidException.class);

        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, Object>> response =
                handler.handleValidationErrors(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

        assertNotNull(response.getBody());

        Map<String, String> errors =
                (Map<String, String>) response.getBody().get("errors");

        assertEquals(
                "Email is required",
                errors.get("email")
        );
    }

    @Test
    void testHandleBadRequest() {

        BadRequestException ex =
                new BadRequestException("Invalid request");

        ResponseEntity<Map<String, Object>> response =
                handler.handleBadRequest(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

        assertEquals(
                "Invalid request",
                response.getBody().get("message")
        );
    }

    @Test
    void testHandleNotFound() {

        ResourceNotFoundException ex =
                new ResourceNotFoundException("Resource not found");

        ResponseEntity<Map<String, Object>> response =
                handler.handleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        assertEquals(
                "Resource not found",
                response.getBody().get("message")
        );
    }

    @Test
    void testHandleSlotBooked() {

        SlotAlreadyBookedException ex =
                new SlotAlreadyBookedException("Slot already booked");

        ResponseEntity<Map<String, Object>> response =
                handler.handleSlotBooked(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());

        assertEquals(
                "Slot already booked",
                response.getBody().get("message")
        );
    }

    @Test
    void testHandleSlotUnavailable() {

        SlotNotAvailableException ex =
                new SlotNotAvailableException("No slots available");

        ResponseEntity<Map<String, Object>> response =
                handler.handleSlotUnavailable(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        assertEquals(
                "No slots available",
                response.getBody().get("message")
        );
    }

    @Test
    void testHandleAccessDenied() {

        AccessDeniedException ex =
                new AccessDeniedException("Access denied");

        ResponseEntity<Map<String, Object>> response =
                handler.handleAccessDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());

        assertEquals(
                "Access denied",
                response.getBody().get("message")
        );
    }

    @Test
    void testHandleGenericException() {

        Exception ex =
                new Exception("Unexpected error");

        ResponseEntity<Map<String, Object>> response =
                handler.handleGenericException(ex);

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode()
        );

        assertEquals(
                "Internal server error",
                response.getBody().get("message")
        );
    }
}