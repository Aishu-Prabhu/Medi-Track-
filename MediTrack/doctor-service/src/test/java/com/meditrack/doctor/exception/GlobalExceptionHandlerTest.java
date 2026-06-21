package com.meditrack.doctor.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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
                new BeanPropertyBindingResult(new Object(), "doctor");

        bindingResult.addError(
                new FieldError(
                        "doctor",
                        "name",
                        "Name is required"
                )
        );

        MethodArgumentNotValidException ex =
                mock(MethodArgumentNotValidException.class);

        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, String>> response =
                handler.handleValidationErrors(ex);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        assertEquals(
                "Name is required",
                response.getBody().get("name")
        );
    }

    @Test
    void testHandleNotFound() {

        ResourceNotFoundException ex =
                new ResourceNotFoundException("Doctor not found");

        ResponseEntity<Map<String, Object>> response =
                handler.handleNotFound(ex);

        assertEquals(
                HttpStatus.NOT_FOUND,
                response.getStatusCode()
        );

        assertEquals(
                "Doctor not found",
                response.getBody().get("message")
        );
    }

    @Test
    void testHandleDuplicate() {

        DuplicateResourceException ex =
                new DuplicateResourceException("Doctor already exists");

        ResponseEntity<Map<String, Object>> response =
                handler.handleDuplicate(ex);

        assertEquals(
                HttpStatus.CONFLICT,
                response.getStatusCode()
        );

        assertEquals(
                "Doctor already exists",
                response.getBody().get("message")
        );
    }

    @Test
    void testHandleBadRequest() {

        BadRequestException ex =
                new BadRequestException("Invalid request");

        ResponseEntity<Map<String, Object>> response =
                handler.handleBadRequest(ex);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        assertEquals(
                "Invalid request",
                response.getBody().get("message")
        );
    }

    @Test
    void testHandleGeneric() {

        Exception ex =
                new Exception("Unexpected error");

        ResponseEntity<Map<String, Object>> response =
                handler.handleGeneric(ex);

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode()
        );

        assertTrue(
                response.getBody()
                        .get("message")
                        .toString()
                        .contains("Something went wrong")
        );
    }

    @Test
    void testHandleInvalidEnum() {

        HttpMessageNotReadableException ex =
                new HttpMessageNotReadableException(
                        "Cannot deserialize value of type Specialization"
                );

        ResponseEntity<Map<String, Object>> response =
                handler.handleInvalidEnum(ex);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        assertTrue(
                response.getBody()
                        .get("message")
                        .toString()
                        .contains("Invalid specialization")
        );
    }

    enum DummyEnum {
        VALUE1,
        VALUE2
    }

    @Test
    void testHandleEnumMismatch() {

        MethodArgumentTypeMismatchException ex =
                new MethodArgumentTypeMismatchException(
                        "WRONG_VALUE",
                        DummyEnum.class,
                        "specialization",
                        mock(MethodParameter.class),
                        new IllegalArgumentException()
                );

        ResponseEntity<Map<String, Object>> response =
                handler.handleEnumMismatch(ex);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        assertTrue(
                response.getBody()
                        .get("message")
                        .toString()
                        .contains("Invalid value")
        );
    }
}