package com.meditrack.notification.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {

    private Long id;
    private Long patientId;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}