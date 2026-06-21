package com.meditrack.prescription.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PrescriptionUpdateRequest {

    @Size(min = 5, max = 500, message = "Diagnosis must be between 5 and 500 characters")
    private String diagnosis;

    @Size(min = 3, max = 500, message = "Medicines must be between 3 and 500 characters")
    private String medicines;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    @Future(message = "Follow-up date must be in the future")
    private LocalDate followUpDate;
}