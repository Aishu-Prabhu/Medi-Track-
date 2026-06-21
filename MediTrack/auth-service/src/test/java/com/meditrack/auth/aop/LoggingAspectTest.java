package com.meditrack.auth.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.slf4j.MDC;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LoggingAspectTest {

    @InjectMocks
    private LoggingAspect loggingAspect;

    @Mock
    private ProceedingJoinPoint joinPoint;

    @Mock
    private Signature signature;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLogServiceMethods_Success() throws Throwable {

        when(joinPoint.getSignature()).thenReturn(signature);

        when(signature.toShortString())
                .thenReturn("TestService.testMethod()");

        when(joinPoint.getArgs())
                .thenReturn(new Object[]{"arg1", 123});

        when(joinPoint.proceed())
                .thenReturn("SUCCESS");

        Object result =
                loggingAspect.logServiceMethods(joinPoint);

        assertEquals("SUCCESS", result);

        verify(joinPoint, times(1)).proceed();

        assertNull(MDC.get("traceId"));
    }

    @Test
    void testLogControllerMethods_Success() throws Throwable {

        when(joinPoint.getSignature()).thenReturn(signature);

        when(signature.toShortString())
                .thenReturn("TestController.testMethod()");

        when(joinPoint.getArgs())
                .thenReturn(new Object[]{"data"});

        when(joinPoint.proceed())
                .thenReturn("OK");

        Object result =
                loggingAspect.logControllerMethods(joinPoint);

        assertEquals("OK", result);

        verify(joinPoint, times(1)).proceed();

        assertNull(MDC.get("traceId"));
    }

    @Test
    void testLogExecution_Exception() throws Throwable {

        when(joinPoint.getSignature()).thenReturn(signature);

        when(signature.toShortString())
                .thenReturn("TestService.errorMethod()");

        when(joinPoint.getArgs())
                .thenReturn(new Object[]{"test"});

        when(joinPoint.proceed())
                .thenThrow(new RuntimeException("Something went wrong"));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> loggingAspect.logServiceMethods(joinPoint)
                );

        assertEquals(
                "Something went wrong",
                exception.getMessage()
        );

        verify(joinPoint, times(1)).proceed();

        assertNull(MDC.get("traceId"));
    }
}