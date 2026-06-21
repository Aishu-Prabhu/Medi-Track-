package com.meditrack.patient.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.UUID;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);
    
    private static final String TRACE_ID="traceId";

    @Around("execution(* com.meditrack.patient.service..*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logExecution(joinPoint, "SERVICE");
    }

    @Around("execution(* com.meditrack.patient.controller..*(..))")
    public Object logControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logExecution(joinPoint, "CONTROLLER");
    }

    private Object logExecution(ProceedingJoinPoint joinPoint, String layer) throws Throwable {
        String traceId = MDC.get(TRACE_ID);
        if (traceId == null) {
            traceId = UUID.randomUUID().toString().substring(0, 8);
            MDC.put(TRACE_ID, traceId);
        }

        String method = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();
        long start = System.currentTimeMillis();

        log.info("[{}][{}] --> {} | args: {}", layer, traceId, method, Arrays.toString(args));

        try {
            Object result = joinPoint.proceed();
            long elapsed = System.currentTimeMillis() - start;
            log.info("[{}][{}] <-- {} | {}ms | result: {}", layer, traceId, method, elapsed, result);
            return result;

        } catch (Exception ex) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("[{}][{}] !! {} | {}ms | error: {}", layer, traceId, method, elapsed, ex.getMessage(), ex);
            throw ex;

        } finally {
            MDC.remove(TRACE_ID);
        }
    }
}