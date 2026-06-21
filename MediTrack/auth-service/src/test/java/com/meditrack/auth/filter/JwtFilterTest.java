package com.meditrack.auth.filter;

import com.meditrack.auth.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private JwtFilter jwtFilter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testDoFilterInternal_ValidToken()
            throws ServletException, IOException {

        String token = "valid-token";

        when(request.getHeader("Authorization"))
                .thenReturn("Bearer " + token);

        when(jwtUtil.validateToken(token))
                .thenReturn(true);

        when(jwtUtil.extractEmail(token))
                .thenReturn("test@gmail.com");

        when(jwtUtil.extractRole(token))
                .thenReturn("ADMIN");

        jwtFilter.doFilterInternal(
                request,
                response,
                filterChain
        );

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        assertNotNull(auth);

        assertEquals(
                "test@gmail.com",
                auth.getPrincipal()
        );

        assertEquals(
                "ROLE_ADMIN",
                auth.getAuthorities()
                        .iterator()
                        .next()
                        .getAuthority()
        );

        verify(filterChain, times(1))
                .doFilter(request, response);
    }

    @Test
    void testDoFilterInternal_InvalidToken()
            throws ServletException, IOException {

        String token = "invalid-token";

        when(request.getHeader("Authorization"))
                .thenReturn("Bearer " + token);

        when(jwtUtil.validateToken(token))
                .thenReturn(false);

        jwtFilter.doFilterInternal(
                request,
                response,
                filterChain
        );

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        assertNull(auth);

        verify(filterChain, times(1))
                .doFilter(request, response);
    }

    @Test
    void testDoFilterInternal_NoAuthorizationHeader()
            throws ServletException, IOException {

        when(request.getHeader("Authorization"))
                .thenReturn(null);

        jwtFilter.doFilterInternal(
                request,
                response,
                filterChain
        );

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        assertNull(auth);

        verify(filterChain, times(1))
                .doFilter(request, response);
    }
}