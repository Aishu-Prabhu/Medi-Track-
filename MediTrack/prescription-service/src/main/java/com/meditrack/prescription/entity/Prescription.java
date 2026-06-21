package com.meditrack.prescription.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long appointmentId;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private Long doctorId;

    private String patientName;
    private String doctorName;

    @Column(nullable = false, length = 500)
    private String diagnosis;

    @Column(nullable = false, length = 500)
    private String medicines;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private LocalDate followUpDate;

    private LocalDate prescriptionDate = LocalDate.now();
}