package com.meditrack.doctor.config;

import com.meditrack.doctor.filter.JwtFilter;
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

                // VIEW DOCTORS
                .requestMatchers(HttpMethod.GET, "/doctors/all")
                .hasAnyRole("SUPER_ADMIN","PATIENT","DOCTOR","ADMIN")

                .requestMatchers(HttpMethod.GET, "/doctors/available")
                .hasAnyRole("SUPER_ADMIN","PATIENT","DOCTOR","ADMIN")

                .requestMatchers(HttpMethod.GET, "/doctors/specialization/**")
                .hasAnyRole("SUPER_ADMIN","PATIENT","DOCTOR","ADMIN")

                .requestMatchers(HttpMethod.GET, "/doctors/**")
                .hasAnyRole("SUPER_ADMIN","PATIENT","DOCTOR","ADMIN")

                // MANAGE DOCTORS
                .requestMatchers(HttpMethod.POST, "/doctors/add")
                .hasAnyRole("ADMIN","SUPER_ADMIN")

                .requestMatchers(HttpMethod.PUT, "/doctors/update/**")
                .hasAnyRole("ADMIN","SUPER_ADMIN")

             
                .requestMatchers(HttpMethod.DELETE, "/doctors/delete/**")
                .hasAnyRole("ADMIN","SUPER_ADMIN")

                // TOGGLE
                .requestMatchers(HttpMethod.PUT,
                        "/doctors/toggle-availability/**")
                .hasAnyRole("DOCTOR","ADMIN","SUPER_ADMIN")
                
                
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