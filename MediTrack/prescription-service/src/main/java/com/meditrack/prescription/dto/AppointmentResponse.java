package com.meditrack.prescription.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@NoArgsConstructor
@Getter
@Setter
public class AppointmentResponse {

    private Long id;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private String specialization;

    private LocalDate appointmentDate; 
    private String slot;
    private String status;
}