package com.meditrack.appointment.config;

import com.meditrack.appointment.filter.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                

                // Only ADMIN / DOCTOR / SUPER_ADMIN can generate slots
                .requestMatchers(HttpMethod.POST, "/slots/generate/**")
                .hasAnyRole("ADMIN", "DOCTOR", "SUPER_ADMIN")

                // All roles can view slots
                .requestMatchers(HttpMethod.GET, "/slots/**")
                .hasAnyRole("PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN")


                // =========================
                // APPOINTMENT MANAGEMENT
                // =========================

                // Only ADMIN / SUPER_ADMIN can view all appointments
                .requestMatchers("/appointments/all")
                .hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Internal call from payment-service after payment success
                .requestMatchers(HttpMethod.PUT, "/appointments/payment-success/**")
                .permitAll()

                // PATIENT / ADMIN / SUPER_ADMIN can book
                .requestMatchers(HttpMethod.POST, "/appointments/book")
                .hasAnyRole("PATIENT", "ADMIN", "SUPER_ADMIN")

                // PATIENT / DOCTOR / ADMIN / SUPER_ADMIN can cancel
                .requestMatchers(HttpMethod.PUT, "/appointments/cancel/**")
                .hasAnyRole("PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN")

                // DOCTOR / ADMIN / SUPER_ADMIN can complete
                .requestMatchers(HttpMethod.PUT, "/appointments/complete/**")
                .hasAnyRole("DOCTOR", "ADMIN", "SUPER_ADMIN")

                // All authenticated roles can view appointment data
                .requestMatchers(HttpMethod.GET, "/appointments/**")
                .hasAnyRole("PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN")


                
             // Swagger
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtFilter(),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}