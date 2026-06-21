package com.meditrack.payment.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {

                var context = SecurityContextHolder.getContext();

                if (context.getAuthentication() != null) {

                    Object credentials = context.getAuthentication().getCredentials();

                    if (credentials != null) {
                        template.header("Authorization", credentials.toString());
                    }
                }
            }
        };
    }
}