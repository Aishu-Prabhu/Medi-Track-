package com.meditrack.patient.config;

import com.meditrack.patient.filter.JwtFilter;
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

            	    .requestMatchers(HttpMethod.POST,"/patients/register-profile").permitAll()

            	    // SPECIFIC FIRST
            	    .requestMatchers(HttpMethod.GET, "/patients/all")
            	    .hasAnyRole("ADMIN","SUPER_ADMIN")

            	    .requestMatchers(HttpMethod.DELETE, "/patients/delete/**")
            	    .hasAnyRole("ADMIN","SUPER_ADMIN")

            	    // GENERAL AFTER
            	    .requestMatchers(HttpMethod.GET, "/patients/**")
            	    .hasAnyRole("PATIENT","DOCTOR","ADMIN","SUPER_ADMIN")

            	    .requestMatchers(HttpMethod.POST, "/patients/add")
            	    .hasAnyRole("PATIENT","ADMIN","SUPER_ADMIN")

            	    .requestMatchers(HttpMethod.PUT, "/patients/update/**")
            	    .hasAnyRole("PATIENT","ADMIN","SUPER_ADMIN")

            	    .requestMatchers(HttpMethod.PUT, "/patients/update-history/**")
            	    .hasAnyRole("DOCTOR","PATIENT","ADMIN","SUPER_ADMIN")
            	    
            	    
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