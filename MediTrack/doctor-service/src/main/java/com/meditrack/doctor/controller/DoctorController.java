package com.meditrack.doctor.controller;

import com.meditrack.doctor.dto.DoctorRequest;
import com.meditrack.doctor.dto.DoctorResponse;
import com.meditrack.doctor.entity.Specialization;
import com.meditrack.doctor.service.DoctorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "Doctor APIs", description = "APIs for doctor management, availability, and specialization handling")
@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;


    //ADD DOCTOR
    @Operation(summary = "Add new doctor")
    @PostMapping("/add")
    public ResponseEntity<DoctorResponse> addDoctor(
            @Valid @RequestBody DoctorRequest dto) {

        return ResponseEntity.ok(doctorService.addDoctor(dto));
    }

    //GET BY ID
    @Operation(summary = "Get doctor details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long id) {

        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    //GET ALL
    @Operation(summary = "Get all doctors")
    @GetMapping("/all")
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {

        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    //GET AVAILABLE
    @Operation(summary = "Get all available doctors")
    @GetMapping("/available")
    public ResponseEntity<List<DoctorResponse>> getAvailableDoctors() {

        return ResponseEntity.ok(doctorService.getAvailableDoctors());
    }

    //GET BY SPECIALIZATION (ENUM)
    @Operation(summary = "Get doctors by specialization")
    @GetMapping("/specialization/{spec}")
    public ResponseEntity<List<DoctorResponse>> getBySpecialization(
            @PathVariable Specialization spec) {

        return ResponseEntity.ok(
                doctorService.getDoctorsBySpecialization(spec));
    }

    //UPDATE
    @Operation(summary = "Update doctor details")
    @PutMapping("/update/{id}")
    public ResponseEntity<DoctorResponse> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest dto) {

        return ResponseEntity.ok(
                doctorService.updateDoctor(id, dto));
    }

    //DELETE
    @Operation(summary = "Delete doctor")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {

        return ResponseEntity.ok(doctorService.deleteDoctor(id));
    }

    //TOGGLE AVAILABILITY
    @Operation(summary = "Toggle doctor availability status")
    @PutMapping("/toggle-availability/{id}")
    public ResponseEntity<DoctorResponse> toggleAvailability(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                doctorService.toggleAvailability(id));
    }
    @Operation(summary = "Get doctor details by email")
    @GetMapping("/email/{email:.+}")
    public ResponseEntity<DoctorResponse> getDoctorByEmail(
            @PathVariable String email) {

        return ResponseEntity.ok(
                doctorService.getDoctorByEmail(email));
    }
}