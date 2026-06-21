package com.meditrack.appointment.controller;

import com.meditrack.appointment.dto.AppointmentRequest;
import com.meditrack.appointment.dto.CancelRequest;
import com.meditrack.appointment.entity.Appointment;
import com.meditrack.appointment.service.AppointmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "Appointment APIs",description = "APIs for appointment booking, cancellation, completion, and payment handling")
@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;


    //Book a new appointment
    @Operation(summary = "Book a new appointment") 
    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {

        Appointment appointment =
                appointmentService.bookAppointment(request);

        return ResponseEntity.status(201).body(appointment);
    }

    //Get appointment by ID
    @Operation(summary = "Get appointment details by appointment ID")
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getById(@PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentById(id)
        );
    }

    //Get all appointments
    @Operation(summary = "Get all appointments")
    @GetMapping("/all")
    public ResponseEntity<List<Appointment>> getAll() {

        return ResponseEntity.ok(
                appointmentService.getAllAppointments()
        );
    }

    //Get appointments by patient ID
    @Operation(summary = "Get appointments by patient ID")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getByPatient(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentsByPatient(patientId)
        );
    }

    //Get appointments by doctor ID
    @Operation(summary = "Get appointments by doctor ID")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getByDoctor(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentsByDoctor(doctorId)
        );
    }

    //Cancel appointment
    @Operation(summary = "Cancel appointment with reason")
    @PutMapping("/cancel/{id}")
    public ResponseEntity<Appointment> cancel(
            @PathVariable Long id,
            @RequestBody CancelRequest request) {

        return ResponseEntity.ok(
                appointmentService.cancelAppointment(
                        id,
                        request.getReason()
                )
        );
    }

    //Mark appointment as completed
    @Operation(summary = "Cancel appointment with reason")
    @PutMapping("/complete/{id}")
    public ResponseEntity<Appointment> complete(@PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.completeAppointment(id)
        );
    }

    //Mark payment success and confirm appointment
    @Operation(summary = "Mark payment success and confirm appointment")
    @PutMapping("/payment-success/{id}")
    public ResponseEntity<Appointment> markPaymentSuccess(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.markPaymentSuccess(id)
        );
    }
    //Refund
    @Operation(summary = "Mark refund as completed")
    @PutMapping("/refund-completed/{id}")
    public ResponseEntity<Appointment> refundCompleted(
            @PathVariable Long id) {

        return ResponseEntity.ok(
            appointmentService.markRefundCompleted(id)
        );
    }
}