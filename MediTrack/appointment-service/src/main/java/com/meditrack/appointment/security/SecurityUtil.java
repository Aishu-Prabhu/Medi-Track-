package com.meditrack.appointment.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static String getLoggedInUserEmail() {
        return (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

  
    public static String getLoggedInUserRole() {
        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();
        return auth.getAuthorities()
                   .iterator()
                   .next()
                   .getAuthority();
    }
}