package com.meditrack.auth.config;

import com.meditrack.auth.filter.JwtFilter;
import com.meditrack.auth.util.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtUtil);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

            	    // Public
            		.requestMatchers(
            			    "/auth/register",
            			    "/auth/login",
            			    "/auth/forgot-password",
            			    "/auth/verify-otp",
            			    "/auth/reset-forgot-password",

            			    // Swagger
            			    "/swagger-ui/**",
            			    "/v3/api-docs/**",
            			    "/swagger-ui.html"
            			).permitAll()
                // SUPER_ADMIN only management endpoints
                .requestMatchers(
                    "/auth/admin/create-admin",
                    "/auth/admin/delete-admin/**",
                    "/auth/admin/update-admin/**",
                    "/auth/admin/reset-admin-password/**"
                ).hasRole("SUPER_ADMIN")

                // View admins list/details -> ADMIN + SUPER_ADMIN
                .requestMatchers(
                    "/auth/admin/all",
                    "/auth/admin/{id}",
                    "/auth/admin/list"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Doctor management by both ADMIN + SUPER_ADMIN
                .requestMatchers(
                    "/auth/admin/create-doctor",
                    "/auth/admin/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Authenticated user endpoints
                .requestMatchers("/auth/user/email/**").authenticated()

                .anyRequest().authenticated()
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .addFilterBefore(jwtFilter(),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}