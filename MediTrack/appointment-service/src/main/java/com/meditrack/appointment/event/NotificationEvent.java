package com.meditrack.appointment.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    private String eventType;

    private Long patientId;

    private Long doctorId;

    private String title;

    private String message;
}