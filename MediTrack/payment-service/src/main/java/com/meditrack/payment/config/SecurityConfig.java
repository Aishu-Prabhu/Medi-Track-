package com.meditrack.payment.config;

import com.meditrack.payment.filter.JwtFilter;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
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
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // PAYMENT CREATION 
                .requestMatchers(HttpMethod.POST, "/payments/create")
                    .hasAnyRole("PATIENT", "ADMIN")

                // VERIFY 
                .requestMatchers(HttpMethod.POST, "/payments/verify")
                    .hasAnyRole("PATIENT", "ADMIN")
                    
                   

                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter(),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}