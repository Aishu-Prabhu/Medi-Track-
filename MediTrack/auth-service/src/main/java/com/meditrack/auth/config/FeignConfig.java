package com.meditrack.auth.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

	@Bean
	public RequestInterceptor requestInterceptor() {
	    return requestTemplate -> {
	        var attrs = (org.springframework.web.context.request.ServletRequestAttributes)
	                org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();

	        if (attrs != null) {
	            String authHeader = attrs.getRequest().getHeader("Authorization");

	            if (authHeader != null) {
	                requestTemplate.header("Authorization", authHeader);
	            }
	        }
	    };
	}
}