package com.meditrack.appointment.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name="appointments")
public class Appointment {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	@NotNull(message = "Patient ID cannot be null")
	private Long patientId;
	@NotNull(message = "Doctor ID cannot be null")
	private Long doctorId;
	private String patientName;
	private String doctorName;
	private String specialization;
	private Double consultationFee;
	@NotNull(message = "Appointment date cannot be null")
	private LocalDate appointmentDate;
	@NotNull(message = "Slot cannot be null")
	private String slot;
	
	@Enumerated(EnumType.STRING)
	private AppointmentStatus status=AppointmentStatus.PENDING_PAYMENT;
	
	private String cancelReason;
	private String cancelledBy;
	private LocalDateTime cancelledAt;
	private String refundStatus;

}
