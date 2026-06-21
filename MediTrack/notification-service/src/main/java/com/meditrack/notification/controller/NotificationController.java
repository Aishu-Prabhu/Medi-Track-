package com.meditrack.notification.controller;

import com.meditrack.notification.entity.Notification;
import com.meditrack.notification.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Tag(name = "Notification APIs", description = "APIs for notification management and status tracking")
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;


    // CREATE
    @Operation(summary = "Create new notification")
    @PostMapping("/add")
    public Notification add(
            @RequestBody Notification n
    ) {
        return service.create(n);
    }

    // PATIENT LIST
    @Operation(summary = "Get notifications for patient")
    @GetMapping("/patient/{patientId}")
    public List<Notification> patient(
            @PathVariable Long patientId
    ) {
        return service.getByPatient(
                patientId
        );
    }

    // DOCTOR LIST 
    @Operation(summary = "Get notifications for doctor")
    @GetMapping("/doctor/{doctorId}")
    public List<Notification> doctor(
            @PathVariable Long doctorId
    ) {
        return service.getByDoctor(
                doctorId
        );
    }

    // PATIENT UNREAD
    @Operation(summary = "Get unread notification count for patient")
    @GetMapping("/unread/{patientId}")
    public long unread(
            @PathVariable Long patientId
    ) {
        return service.unread(
                patientId
        );
    }

    // MARK READ
    @Operation(summary = "Mark notification as read")
    @PutMapping("/read/{id}")
    public void read(
            @PathVariable Long id
    ) {
        service.markRead(id);
    }
}