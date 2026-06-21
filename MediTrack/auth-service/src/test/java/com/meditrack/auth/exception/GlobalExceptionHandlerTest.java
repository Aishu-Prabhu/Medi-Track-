package com.meditrack.auth.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
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

        ResponseEntity<?> response =
                handler.handleValidationErrors(ex);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        Map<String, String> body =
                (Map<String, String>) response.getBody();

        assertEquals(
                "Email is required",
                body.get("email")
        );
    }

    @Test
    void testHandleDuplicateEntry() {

        DataIntegrityViolationException ex =
                new DataIntegrityViolationException("Duplicate");

        ResponseEntity<?> response =
                handler.handleDuplicateEntry(ex);

        assertEquals(
                HttpStatus.CONFLICT,
                response.getStatusCode()
        );

        Map<String, Object> body =
                (Map<String, Object>) response.getBody();

        assertEquals(
                "Email already exists. Please use a different email.",
                body.get("message")
        );
    }

    @Test
    void testHandleUserNotFound() {

        UserNotFoundException ex =
                new UserNotFoundException("User not found");

        ResponseEntity<?> response =
                handler.handleUserNotFound(ex);

        assertEquals(
                HttpStatus.NOT_FOUND,
                response.getStatusCode()
        );

        Map<String, Object> body =
                (Map<String, Object>) response.getBody();

        assertEquals(
                "User not found",
                body.get("message")
        );
    }

    @Test
    void testHandleInvalidCredentials() {

        InvalidCredentialsException ex =
                new InvalidCredentialsException("Invalid credentials");

        ResponseEntity<?> response =
                handler.handleInvalidCredentials(ex);

        assertEquals(
                HttpStatus.UNAUTHORIZED,
                response.getStatusCode()
        );

        Map<String, Object> body =
                (Map<String, Object>) response.getBody();

        assertEquals(
                "Invalid credentials",
                body.get("message")
        );
    }

    @Test
    void testHandleUserExists() {

        UserAlreadyExistsException ex =
                new UserAlreadyExistsException("User already exists");

        ResponseEntity<?> response =
                handler.handleUserExists(ex);

        assertEquals(
                HttpStatus.CONFLICT,
                response.getStatusCode()
        );

        Map<String, Object> body =
                (Map<String, Object>) response.getBody();

        assertEquals(
                "User already exists",
                body.get("message")
        );
    }

    @Test
    void testHandleBadRequest() {

        BadRequestException ex =
                new BadRequestException("Bad request");

        ResponseEntity<?> response =
                handler.handleBadRequest(ex);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        Map<String, Object> body =
                (Map<String, Object>) response.getBody();

        assertEquals(
                "Bad request",
                body.get("message")
        );
    }

    @Test
    void testHandleGenericException() {

        Exception ex =
                new Exception("Unexpected error");

        ResponseEntity<?> response =
                handler.handleGenericException(ex);

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode()
        );

        Map<String, Object> body =
                (Map<String, Object>) response.getBody();

        assertEquals(
                "Something went wrong",
                body.get("message")
        );
    }

    @Test
    void testHandleUnauthorized() {

        UnauthorizedException ex =
                new UnauthorizedException("Unauthorized");

        ResponseEntity<Map<String, String>> response =
                handler.handleUnauthorized(ex);

        assertEquals(
                HttpStatus.FORBIDDEN,
                response.getStatusCode()
        );

        assertEquals(
                "Unauthorized",
                response.getBody().get("error")
        );
    }
}