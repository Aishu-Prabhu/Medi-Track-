package com.meditrack.doctor.aop;

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
        MDC.clear();
    }

    @Test
    void testLogServiceMethods_Success() throws Throwable {

        // Arrange
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("DoctorService.getDoctor()");
        when(joinPoint.getArgs()).thenReturn(new Object[]{"101"});
        when(joinPoint.proceed()).thenReturn("SUCCESS");

        // Act
        Object result = loggingAspect.logServiceMethods(joinPoint);

        // Assert
        assertEquals("SUCCESS", result);

        verify(joinPoint, times(1)).proceed();
        verify(joinPoint, atLeastOnce()).getArgs();
        verify(signature, atLeastOnce()).toShortString();

        // MDC should be cleared in finally block
        assertNull(MDC.get("traceId"));
    }

    @Test
    void testLogControllerMethods_Success() throws Throwable {

        // Arrange
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("DoctorController.getDoctors()");
        when(joinPoint.getArgs()).thenReturn(new Object[]{});
        when(joinPoint.proceed()).thenReturn("DATA");

        // Act
        Object result = loggingAspect.logControllerMethods(joinPoint);

        // Assert
        assertEquals("DATA", result);

        verify(joinPoint, times(1)).proceed();

        assertNull(MDC.get("traceId"));
    }

    @Test
    void testLogExecution_Exception() throws Throwable {

        // Arrange
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("DoctorService.saveDoctor()");
        when(joinPoint.getArgs()).thenReturn(new Object[]{"doctor"});
        when(joinPoint.proceed()).thenThrow(new RuntimeException("Database Error"));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> loggingAspect.logServiceMethods(joinPoint)
        );

        assertEquals("Database Error", exception.getMessage());

        verify(joinPoint, times(1)).proceed();

        // MDC should still be cleared even after exception
        assertNull(MDC.get("traceId"));
    }

    @Test
    void testExistingTraceId() throws Throwable {

        // Arrange
        MDC.put("traceId", "existing123");

        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("DoctorService.find()");
        when(joinPoint.getArgs()).thenReturn(new Object[]{1});
        when(joinPoint.proceed()).thenReturn("FOUND");

        // Act
        Object result = loggingAspect.logServiceMethods(joinPoint);

        // Assert
        assertEquals("FOUND", result);

        verify(joinPoint, times(1)).proceed();

        // finally block removes traceId
        assertNull(MDC.get("traceId"));
    }
}