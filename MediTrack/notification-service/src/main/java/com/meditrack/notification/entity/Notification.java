package com.meditrack.notification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Patient Notifications
    private Long patientId;

    // Doctor Notifications 
    private Long doctorId;

    private String title;

    @Column(length = 1000)
    private String message;

    private boolean isRead = false;

    private LocalDateTime createdAt =
            LocalDateTime.now();
}