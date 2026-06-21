package com.meditrack.prescription.exception;

import jakarta.servlet.http.HttpServletRequest;

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

    private HttpServletRequest request;

    @BeforeEach
    void setUp() {

        handler = new GlobalExceptionHandler();

        request = mock(HttpServletRequest.class);

        when(request.getRequestURI())
                .thenReturn("/prescriptions/test");
    }

    @Test
    void testHandleValidationErrors() {

        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(
                        new Object(),
                        "prescription"
                );

        bindingResult.addError(
                new FieldError(
                        "prescription",
                        "medicine",
                        "Medicine is required"
                )
        );

        MethodArgumentNotValidException ex =
                mock(MethodArgumentNotValidException.class);

        when(ex.getBindingResult())
                .thenReturn(bindingResult);

        ResponseEntity<ErrorResponse> response =
                handler.handleValidationErrors(
                        ex,
                        request
                );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        assertEquals(
                "Validation Failed",
                response.getBody().getError()
        );

        assertEquals(
                "Invalid input data",
                response.getBody().getMessage()
        );

        Map<String, String> errors =
                response.getBody().getValidationErrors();

        assertEquals(
                "Medicine is required",
                errors.get("medicine")
        );
    }

    @Test
    void testHandleNotFound() {

        ResourceNotFoundException ex =
                new ResourceNotFoundException(
                        "Prescription not found"
                );

        ResponseEntity<ErrorResponse> response =
                handler.handleNotFound(
                        ex,
                        request
                );

        assertEquals(
                HttpStatus.NOT_FOUND,
                response.getStatusCode()
        );

        assertEquals(
                "Prescription not found",
                response.getBody().getMessage()
        );
    }

    @Test
    void testHandleBadRequest() {

        BadRequestException ex =
                new BadRequestException(
                        "Invalid request"
                );

        ResponseEntity<ErrorResponse> response =
                handler.handleBadRequest(
                        ex,
                        request
                );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        assertEquals(
                "Invalid request",
                response.getBody().getMessage()
        );
    }

    @Test
    void testHandleConflict() {

        ConflictException ex =
                new ConflictException(
                        "Prescription already exists"
                );

        ResponseEntity<ErrorResponse> response =
                handler.handleConflict(
                        ex,
                        request
                );

        assertEquals(
                HttpStatus.CONFLICT,
                response.getStatusCode()
        );

        assertEquals(
                "Prescription already exists",
                response.getBody().getMessage()
        );
    }

    @Test
    void testHandleUnauthorized() {

        UnauthorizedException ex =
                new UnauthorizedException(
                        "Unauthorized access"
                );

        ResponseEntity<ErrorResponse> response =
                handler.handleUnauthorized(
                        ex,
                        request
                );

        assertEquals(
                HttpStatus.UNAUTHORIZED,
                response.getStatusCode()
        );

        assertEquals(
                "Unauthorized access",
                response.getBody().getMessage()
        );
    }

    @Test
    void testHandleGeneric() {

        Exception ex =
                new Exception("Unexpected error");

        ResponseEntity<ErrorResponse> response =
                handler.handleGeneric(
                        ex,
                        request
                );

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode()
        );

        assertEquals(
                "Internal server error",
                response.getBody().getMessage()
        );
    }
}