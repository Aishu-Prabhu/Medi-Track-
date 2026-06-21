package com.meditrack.prescription.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionRequestDTO {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotBlank(message = "Diagnosis cannot be empty")
    @Size(min = 5, max = 500, message = "Diagnosis must be between 5 and 500 characters")
    private String diagnosis;

    @NotBlank(message = "Medicines cannot be empty")
    @Size(min = 3, max = 500, message = "Medicines must be between 3 and 500 characters")
    private String medicines;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    @NotNull(message = "Follow-up date is required")
    @Future(message = "Follow-up date must be in the future")
    private LocalDate followUpDate;
}