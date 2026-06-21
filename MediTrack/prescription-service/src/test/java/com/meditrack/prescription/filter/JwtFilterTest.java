package com.meditrack.prescription.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtFilterTest {

    private JwtFilter filter;

    @BeforeEach
    void setup() {
        filter = new JwtFilter();
        SecurityContextHolder.clearContext();
    }

    // ✅ 1. No Authorization header
    @Test
    void testDoFilter_NoHeader() throws ServletException, IOException {

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
    }

    // ❌ 2. Invalid token
    @Test
    void testDoFilter_InvalidToken() throws Exception {

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid_token");

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
        assertEquals("Invalid or expired token", response.getContentAsString());
    }

    // ✅ 3. Valid token
    @Test
    void testDoFilter_ValidToken() throws Exception {

        String secret = "meditrack_super_secret_key_2024_aishu_jwt";

        String token = io.jsonwebtoken.Jwts.builder()
                .setSubject("test@gmail.com")
                .claim("role", "DOCTOR")
                .signWith(
                        io.jsonwebtoken.security.Keys.hmacShaKeyFor(secret.getBytes())
                )
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("test@gmail.com",
                SecurityContextHolder.getContext().getAuthentication().getPrincipal());

        verify(chain, times(1)).doFilter(request, response);
    }
}