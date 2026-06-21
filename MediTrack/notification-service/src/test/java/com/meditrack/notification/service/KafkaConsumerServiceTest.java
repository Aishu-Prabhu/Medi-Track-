package com.meditrack.notification.service;

import com.meditrack.notification.entity.Notification;
import com.meditrack.notification.event.NotificationEvent;
import com.meditrack.notification.repository.NotificationRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KafkaConsumerServiceTest {

    @InjectMocks
    private KafkaConsumerService kafkaConsumerService;

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationEvent event;

    @BeforeEach
    void setUp() {

        event = new NotificationEvent();

        event.setPatientId(1L);
        event.setDoctorId(2L);

        event.setTitle("Appointment Booked");

        event.setMessage(
                "Your appointment has been booked successfully"
        );
    }

    @Test
    void testConsumeNotification() {

        kafkaConsumerService.consumeNotification(event);

        ArgumentCaptor<Notification> captor =
                ArgumentCaptor.forClass(Notification.class);

        verify(notificationRepository, times(1))
                .save(captor.capture());

        Notification savedNotification =
                captor.getValue();

        assertEquals(
                event.getPatientId(),
                savedNotification.getPatientId()
        );

        assertEquals(
                event.getDoctorId(),
                savedNotification.getDoctorId()
        );

        assertEquals(
                event.getTitle(),
                savedNotification.getTitle()
        );

        assertEquals(
                event.getMessage(),
                savedNotification.getMessage()
        );
    }
}