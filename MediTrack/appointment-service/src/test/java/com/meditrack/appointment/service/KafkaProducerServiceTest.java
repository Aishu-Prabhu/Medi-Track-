package com.meditrack.appointment.service;

import com.meditrack.appointment.event.NotificationEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.kafka.core.KafkaTemplate;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KafkaProducerServiceTest {

    @InjectMocks
    private KafkaProducerService kafkaProducerService;

    @Mock
    private KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    private NotificationEvent event;

    @BeforeEach
    void setUp() {

        event = new NotificationEvent();

        event.setEventType("APPOINTMENT_BOOKED");
        event.setPatientId(1L);
        event.setTitle("Appointment Booked");
        event.setMessage("Your appointment is booked");
    }

    @Test
    void testSendNotification() {

        kafkaProducerService.sendNotification(event);

        verify(kafkaTemplate, times(1))
                .send("notifications", event);
    }
}