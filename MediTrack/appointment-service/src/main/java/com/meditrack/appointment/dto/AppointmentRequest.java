package com.meditrack.appointment.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
public class AppointmentRequest {


    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate appointmentDate;

    @NotBlank(message = "Slot is required")
    @Pattern(
    	    regexp = "^(09:00 AM|10:00 AM|11:00 AM|02:00 PM|03:00 PM|04:00 PM)$",
    	    message = "Invalid slot. Allowed slots: 09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM, 04:00 PM"
    	)
    private String slot;

    
}
