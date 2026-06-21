package com.meditrack.patient.excpetion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.meditrack.patient.exception.AccessDeniedException;
import com.meditrack.patient.exception.DuplicateResourceException;
import com.meditrack.patient.exception.GlobalExceptionHandler;
import com.meditrack.patient.exception.ResourceNotFoundException;

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
                new BeanPropertyBindingResult(new Object(), "patient");

        bindingResult.addError(
                new FieldError(
                        "patient",
                        "email",
                        "Email is required"
                )
        );

        MethodArgumentNotValidException ex =
                mock(MethodArgumentNotValidException.class);

        when(ex.getBindingResult())
                .thenReturn(bindingResult);

        ResponseEntity<Map<String, String>> response =
                handler.handleValidationErrors(ex);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        assertEquals(
                "Email is required",
                response.getBody().get("email")
        );
    }

    @Test
    void testHandleAccessDenied() {

        AccessDeniedException ex =
                new AccessDeniedException("Access denied");

        ResponseEntity<Map<String, String>> response =
                handler.handleAccessDenied(ex);

        assertEquals(
                HttpStatus.FORBIDDEN,
                response.getStatusCode()
        );

        assertEquals(
                "Access denied",
                response.getBody().get("error")
        );
    }

    @Test
    void testHandleNotFound() {

        ResourceNotFoundException ex =
                new ResourceNotFoundException("Patient not found");

        ResponseEntity<Map<String, String>> response =
                handler.handleNotFound(ex);

        assertEquals(
                HttpStatus.NOT_FOUND,
                response.getStatusCode()
        );

        assertEquals(
                "Patient not found",
                response.getBody().get("error")
        );
    }

    @Test
    void testHandleDuplicate() {

        DuplicateResourceException ex =
                new DuplicateResourceException("Duplicate patient");

        ResponseEntity<Map<String, String>> response =
                handler.handleDuplicate(ex);

        assertEquals(
                HttpStatus.CONFLICT,
                response.getStatusCode()
        );

        assertEquals(
                "Duplicate patient",
                response.getBody().get("error")
        );
    }

    @Test
    void testHandleGeneral() {

        Exception ex =
                new Exception("Unexpected error");

        ResponseEntity<Map<String, String>> response =
                handler.handleGeneral(ex);

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode()
        );

        assertEquals(
                "Unexpected error",
                response.getBody().get("error")
        );
    }
}