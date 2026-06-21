package com.meditrack.prescription.config;

import com.meditrack.prescription.filter.JwtFilter;
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
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // Admin sees all
            		.requestMatchers(HttpMethod.GET, "/prescriptions").hasAnyRole("ADMIN","SUPER_ADMIN")

                // Only DOCTOR and ADMIN can add/update prescriptions
                .requestMatchers(HttpMethod.POST, "/prescriptions/add").hasAnyRole("DOCTOR", "ADMIN","SUPER_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/prescriptions/**").hasAnyRole("DOCTOR", "ADMIN","SUPER_ADMIN")

                // PATIENT can view their own prescriptions
                .requestMatchers(HttpMethod.GET, "/prescriptions/patient/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN","SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/prescriptions/appointment/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN","SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/prescriptions/doctor/**").hasAnyRole("DOCTOR", "ADMIN","SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/prescriptions/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN","SUPER_ADMIN")
             // Swagger
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter(),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}