package com.meditrack.appointment.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtFilterTest {

    private JwtFilter filter;

    private static final String SECRET =
            "meditrack_super_secret_key_2024_aishu_jwt";

    private Key key;

    @BeforeEach
    void setup() {
        filter = new JwtFilter();
        key = Keys.hmacShaKeyFor(SECRET.getBytes());
        SecurityContextHolder.clearContext(); 
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    // =========================
    // NO HEADER
    // =========================
    @Test
    void testDoFilter_NoHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        // No auth header → filter passes through, no authentication set
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain, times(1)).doFilter(request, response);
    }

    // =========================
    // VALID TOKEN — PATIENT
    // =========================
    @Test
    void testDoFilter_ValidToken() throws Exception {
        String token = Jwts.builder()
                .setSubject("aishu@example.com")   // email as subject
                .claim("role", "PATIENT")
                .setIssuedAt(new Date())
                .signWith(key)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        var auth = SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(auth);
        // Filter stores subject (email) as principal — String, not Long
        assertEquals("aishu@example.com", auth.getPrincipal());
        assertTrue(
            auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))
        );
        verify(chain, times(1)).doFilter(request, response);
    }

    // =========================
    // VALID TOKEN — DOCTOR
    // =========================
    @Test
    void testDoFilter_ValidToken_Doctor() throws Exception {
        String token = Jwts.builder()
                .setSubject("doctor@example.com")
                .claim("role", "DOCTOR")
                .setIssuedAt(new Date())
                .signWith(key)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        var auth = SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(auth);
        assertEquals("doctor@example.com", auth.getPrincipal());
        assertTrue(
            auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))
        );
        verify(chain, times(1)).doFilter(request, response);
    }

    // =========================
    // VALID TOKEN — ADMIN
    // =========================
    @Test
    void testDoFilter_ValidToken_Admin() throws Exception {
        String token = Jwts.builder()
                .setSubject("admin@example.com")
                .claim("role", "ADMIN")
                .setIssuedAt(new Date())
                .signWith(key)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        var auth = SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(auth);
        assertEquals("admin@example.com", auth.getPrincipal());
        assertTrue(
            auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
        );
        verify(chain, times(1)).doFilter(request, response);
    }

    // =========================
    // INVALID TOKEN
    // =========================
    @Test
    void testDoFilter_InvalidToken() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid_token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertEquals(401, response.getStatus());
        assertEquals("Invalid or expired token", response.getContentAsString());
        // Chain must NOT proceed on invalid token
        verify(chain, never()).doFilter(request, response);
        // Security context must remain empty
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    // =========================
    // EXPIRED TOKEN
    // =========================
    @Test
    void testDoFilter_ExpiredToken() throws Exception {
        // Token issued and expired in the past
        String token = Jwts.builder()
                .setSubject("aishu@example.com")
                .claim("role", "PATIENT")
                .setIssuedAt(new Date(System.currentTimeMillis() - 10000))
                .setExpiration(new Date(System.currentTimeMillis() - 5000)) // already expired
                .signWith(key)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertEquals(401, response.getStatus());
        assertEquals("Invalid or expired token", response.getContentAsString());
        verify(chain, never()).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    // =========================
    // WRONG SECRET
    // =========================
    @Test
    void testDoFilter_WrongSecret() throws Exception {
        // Token signed with a DIFFERENT secret
        Key wrongKey = Keys.hmacShaKeyFor(
                "completely_wrong_secret_key_xyz_9999".getBytes()
        );

        String token = Jwts.builder()
                .setSubject("aishu@example.com")
                .claim("role", "PATIENT")
                .setIssuedAt(new Date())
                .signWith(wrongKey)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertEquals(401, response.getStatus());
        assertEquals("Invalid or expired token", response.getContentAsString());
        verify(chain, never()).doFilter(request, response);
    }

    // =========================
    // MISSING "Bearer " PREFIX
    // =========================
    @Test
    void testDoFilter_NoBearerPrefix() throws Exception {
        String token = Jwts.builder()
                .setSubject("aishu@example.com")
                .claim("role", "PATIENT")
                .setIssuedAt(new Date())
                .signWith(key)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        // Sending token WITHOUT "Bearer " prefix
        request.addHeader("Authorization", token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        // Filter skips processing — no Bearer prefix means pass through
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain, times(1)).doFilter(request, response);
    }

    // =========================
    // ROLE UPPERCASE NORMALISATION
    // =========================
    @Test
    void testDoFilter_RoleIsUppercased() throws Exception {
        // role claim sent in lowercase — filter should uppercase it
        String token = Jwts.builder()
                .setSubject("aishu@example.com")
                .claim("role", "patient")   // lowercase
                .setIssuedAt(new Date())
                .signWith(key)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertTrue(
            auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))
        );
    }
}