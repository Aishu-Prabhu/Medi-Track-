package com.meditrack.notification.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.meditrack.notification.entity.Notification;
import com.meditrack.notification.repository.NotificationRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService service;

    @Mock
    private NotificationRepository repo;

    private Notification notification;

    @BeforeEach
    void setup() {

        notification = new Notification();
        notification.setId(1L);
        notification.setPatientId(10L);
        notification.setDoctorId(20L);
        notification.setTitle("Appointment Confirmed");
        notification.setMessage("Your appointment is confirmed");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
    }

    // Create notification
    @Test
    void testCreate() {

        when(repo.save(notification))
                .thenReturn(notification);

        Notification result =
                service.create(notification);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    // Get by patient
    @Test
    void testGetByPatient() {

        when(repo.findByPatientIdOrderByCreatedAtDesc(10L))
                .thenReturn(List.of(notification));

        List<Notification> result =
                service.getByPatient(10L);

        assertEquals(1, result.size());
    }

    // Get by doctor
    @Test
    void testGetByDoctor() {

        when(repo.findByDoctorIdOrderByCreatedAtDesc(20L))
                .thenReturn(List.of(notification));

        List<Notification> result =
                service.getByDoctor(20L);

        assertEquals(1, result.size());
    }

    // Unread patient count
    @Test
    void testUnread() {

        when(repo.countByPatientIdAndIsReadFalse(10L))
                .thenReturn(3L);

        long result =
                service.unread(10L);

        assertEquals(3L, result);
    }

    // Unread doctor count
    @Test
    void testUnreadDoctor() {

        when(repo.countByDoctorIdAndIsReadFalse(20L))
                .thenReturn(2L);

        long result =
                service.unreadDoctor(20L);

        assertEquals(2L, result);
    }

    // Mark read
    @Test
    void testMarkRead() {

        when(repo.findById(1L))
                .thenReturn(Optional.of(notification));

        when(repo.save(any(Notification.class)))
                .thenReturn(notification);

        service.markRead(1L);

        assertTrue(notification.isRead());

        verify(repo).save(notification);
    }

    // Mark read not found
    @Test
    void testMarkRead_NotFound() {

        when(repo.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(Exception.class,
                () -> service.markRead(1L));
    }
}