package com.meditrack.prescription.controller;

import com.meditrack.prescription.dto.PrescriptionUpdateRequest;
import com.meditrack.prescription.entity.Prescription;
import com.meditrack.prescription.service.PrescriptionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Prescription APIs", description = "APIs for prescription creation, updates, and patient medication management")
@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor 
public class PrescriptionController {

    private final PrescriptionService prescriptionService;


    //CREATE
    @Operation(summary = "Create new prescription")
    @PostMapping("/add")
    public ResponseEntity<Prescription> addPrescription(
            @Valid @RequestBody Prescription prescription) {

        Prescription saved = prescriptionService.addPrescription(prescription);
        return ResponseEntity.ok(saved);
    }

    //GET BY ID
    @Operation(summary = "Get prescription details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                prescriptionService.getPrescriptionById(id));
    }

    //GET BY APPOINTMENT
    @Operation(summary = "Get prescription by appointment ID")
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Prescription> getByAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                prescriptionService.getPrescriptionByAppointment(appointmentId));
    }

    //GET BY PATIENT
    @Operation(summary = "Get prescriptions by patient ID")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getByPatient(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                prescriptionService.getPrescriptionsByPatient(patientId));
    }

    //GET BY DOCTOR
    @Operation(summary = "Get prescriptions by doctor ID")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Prescription>> getByDoctor(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                prescriptionService.getPrescriptionsByDoctor(doctorId));
    }

    //GET ALL
    @Operation(summary = "Get all prescriptions")
    @GetMapping
    public ResponseEntity<List<Prescription>> getAll() {
        return ResponseEntity.ok(
                prescriptionService.getAllPrescriptions());
    }

    //UPDATE
    @Operation(summary = "Update prescription details")
    @PutMapping("/{id}")
    public ResponseEntity<Prescription> updatePrescription(
            @PathVariable Long id,
            @Valid @RequestBody PrescriptionUpdateRequest req) {

        return ResponseEntity.ok(
                prescriptionService.updatePrescription(id, req));
    }
}