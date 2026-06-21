package com.meditrack.apigateway.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* com.meditrack.apigateway..*(..))")
    public Object logGatewayMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.info("[GATEWAY] --> {}", method);
        try {
            Object result = joinPoint.proceed();
            log.info("[GATEWAY] <-- {} | {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("[GATEWAY] !! {} | error: {}", method, ex.getMessage(), ex);
            throw ex;
        }
    }
}