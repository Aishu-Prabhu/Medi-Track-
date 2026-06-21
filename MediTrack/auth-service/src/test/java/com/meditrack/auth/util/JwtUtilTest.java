package com.meditrack.auth.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setup() {
        jwtUtil = new JwtUtil();

        // Manually set values 
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "meditrack_super_secret_key_2024_aishu_jwt");

        ReflectionTestUtils.setField(jwtUtil, "expiration", 1000 * 60 * 60);
    }

    // GENERATE TOKEN
    @Test
    void testGenerateToken() {
        String token = jwtUtil.generateToken("test@gmail.com", "PATIENT");
        assertNotNull(token);
    }

    //EXTRACT EMAIL
    @Test
    void testExtractEmail() {
        String token = jwtUtil.generateToken("test@gmail.com", "PATIENT");

        String email = jwtUtil.extractEmail(token);

        assertEquals("test@gmail.com", email);
    }

    //VALID TOKEN
    @Test
    void testValidateTokenSuccess() {
        String token = jwtUtil.generateToken("test@gmail.com", "PATIENT");

        boolean valid = jwtUtil.validateToken(token);

        assertTrue(valid);
    }

    //INVALID TOKEN
    @Test
    void testValidateTokenFailure() {
        boolean valid = jwtUtil.validateToken("invalid.token.here");

        assertFalse(valid);
    }
}