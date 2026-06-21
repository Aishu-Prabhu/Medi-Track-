package com.meditrack.appointment.controller;

import com.meditrack.appointment.service.SlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@Tag(name = "Slot APIs", description = "APIs for doctor slot generation and slot availability management")
@RestController
@RequestMapping("/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @Operation(summary = "Generate appointment slots for doctor")
    @PostMapping("/generate/{doctorId}")
    public ResponseEntity<?> generateSlots(
            @PathVariable Long doctorId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                slotService.generateSlots(doctorId, date)
        );
    }

    @Operation(summary = "Get all slots for doctor by date")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAllSlots(
            @PathVariable Long doctorId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                slotService.getAllSlots(doctorId, date)
        );
    }

    @Operation(summary = "Get available slots for doctor by date")
    @GetMapping("/doctor/{doctorId}/available")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                slotService.getAvailableSlots(doctorId, date)
        );
    }
}