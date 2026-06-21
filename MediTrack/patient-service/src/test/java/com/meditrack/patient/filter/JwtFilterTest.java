package com.meditrack.patient.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtFilterTest {

    private JwtFilter jwtFilter;

    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setup() {
        jwtFilter = new JwtFilter();

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);

        SecurityContextHolder.clearContext();
    }

    // NO AUTH HEADER
    @Test
    void testNoAuthorizationHeader() throws Exception {

        when(request.getHeader("Authorization")).thenReturn(null);

        jwtFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    // INVALID TOKEN
    @Test
    void testInvalidToken() throws Exception {

        when(request.getHeader("Authorization"))
                .thenReturn("Bearer invalid_token");

        StringWriter writer = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(writer));

        jwtFilter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertTrue(writer.toString().contains("Invalid or expired token"));
    }

    //VALID TOKEN
    @Test
    void testValidToken() throws Exception {

        String token = io.jsonwebtoken.Jwts.builder()
                .setSubject("test@mail.com")
                .claim("role", "PATIENT")
                .signWith(
                        io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                                "meditrack_super_secret_key_2024_aishu_jwt".getBytes()
                        )
                )
                .compact();

        when(request.getHeader("Authorization"))
                .thenReturn("Bearer " + token);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("test@mail.com",
                SecurityContextHolder.getContext().getAuthentication().getPrincipal());

        verify(filterChain).doFilter(request, response);
    }
}