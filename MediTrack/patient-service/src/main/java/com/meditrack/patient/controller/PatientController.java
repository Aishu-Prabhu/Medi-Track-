package com.meditrack.patient.controller;

import com.meditrack.patient.dto.PatientRequest;
import com.meditrack.patient.dto.PatientResponse;
import com.meditrack.patient.entity.Patient;
import com.meditrack.patient.service.PatientService;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Patient APIs", description = "APIs for patient profile management and medical history handling")
@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;


    //Add Patient
    @Operation(summary = "Add new patient")
    @PostMapping("/add")
    public ResponseEntity<Patient> addPatient(
            @Valid @RequestBody Patient patient) {

        return ResponseEntity.ok(patientService.addPatient(patient));
    }

    //Get Patient by ID
    @Operation(summary = "Get patient details by ID")
    @GetMapping("/id/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {

        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    //Get All Patients
    @Operation(summary = "Get all patients")
    @GetMapping("/all")
    public ResponseEntity<List<Patient>> getAllPatients() {

        return ResponseEntity.ok(patientService.getAllPatients());
    }

    // Update Patient
    @Operation(summary = "Update patient details")
    @PutMapping("/update/{id}")
    public ResponseEntity<Patient> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody Patient patient) {

        return ResponseEntity.ok(
                patientService.updatePatient(id, patient));
    }

    //Delete Patient
    @Operation(summary = "Delete patient")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {

        return ResponseEntity.ok(patientService.deletePatient(id));
    }

    //Update Medical History
    @Operation(summary = "Update patient medical history")
    @PutMapping("/update-history/{id}")
    public ResponseEntity<Patient> updateMedicalHistory(
            @PathVariable Long id,
            @RequestParam String history) {

        return ResponseEntity.ok(
                patientService.updateMedicalHistory(id, history));
    }
    @Operation(summary = "Get patient details by email")
    @GetMapping("/email/{email}")
    public PatientResponse getPatientByEmail(@PathVariable String email) {
        return patientService.getPatientByEmail(email); 
    }
    
    @Operation(summary = "Get logged-in patient profile")
    @GetMapping("/me")
    public ResponseEntity<PatientResponse> getMyProfile(Authentication authentication) {

        String email = authentication.getName();

        PatientResponse patient = patientService.getPatientByEmail(email);

        return ResponseEntity.ok(patient);
    }
    @Operation(summary = "Register patient profile")
    @PostMapping("/register-profile")
    public ResponseEntity<?> createProfile(
            @Valid @RequestBody PatientRequest request) {

        return ResponseEntity.ok(
            patientService.createProfile(request)
        );
    }
}