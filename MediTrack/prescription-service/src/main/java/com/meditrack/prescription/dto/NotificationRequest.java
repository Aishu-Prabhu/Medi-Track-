package com.meditrack.prescription.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationRequest {

    private Long patientId;
    private String title;
    private String message;
}