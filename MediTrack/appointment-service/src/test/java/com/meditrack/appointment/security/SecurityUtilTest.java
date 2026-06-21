package com.meditrack.appointment.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SecurityUtilTest {

    @Test
    void testGetLoggedInUserEmail() {

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        "test@gmail.com",
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_PATIENT"))
                );

        SecurityContextHolder.getContext()
                .setAuthentication(auth);

        String email =
                SecurityUtil.getLoggedInUserEmail();

        assertEquals("test@gmail.com", email);
    }

    @Test
    void testGetLoggedInUserRole() {

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        "test@gmail.com",
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                );

        SecurityContextHolder.getContext()
                .setAuthentication(auth);

        String role =
                SecurityUtil.getLoggedInUserRole();

        assertEquals("ROLE_ADMIN", role);
    }
}